<?php

namespace App\Http\Controllers;

use App\Http\Requests\RfcRequest;
use App\Models\Rfc;
use App\Models\Tag;
use App\Models\Vote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Str;
use Inertia\Inertia;

class RfcController extends Controller
{
    public function index(Request $request)
    {
        $query = Rfc::withRelations()->withVoteCounts()->latestFirst();

        if (Auth::check()) {
            $teamIds = Auth::user()->memberships()->pluck('team_id')->all();
            if ($teamIds !== []) {
                $query->forTeams($teamIds);
            }
        }

        $filters = [
            'q' => $request->input('q'),
            'status' => in_array($request->input('status'), Rfc::STATUSES, true) ? $request->input('status') : null,
            'stale' => $request->boolean('stale'),
        ];

        if ($filters['q']) {
            $query->where(function ($q) use ($filters) {
                $q->where('title', 'like', '%'.$filters['q'].'%')
                    ->orWhere('summary', 'like', '%'.$filters['q'].'%');
            });
        }

        if ($filters['status']) {
            $query->where('status', $filters['status']);
        }

        if ($filters['stale']) {
            $query->where('status', Rfc::STATUS_REVIEW)
                ->where('updated_at', '<', now()->subDays(Rfc::STALE_AFTER_DAYS));
        }

        $rfcs = $this->withPermissions($query->limit(200)->get()->map->transform());

        $tags = Config::get('constants.tags');
        $sections = Config::get('constants.sections');

        return Inertia::render('Rfcs/Index', [
            'rfcs' => $rfcs,
            'user' => Auth::user(),
            'tags' => $tags,
            'sections' => $sections,
            'teams' => Auth::check() ? $this->teamsFor(Auth::user()) : [],
            'filters' => $filters,
        ]);
    }

    private function withPermissions($rfcs)
    {
        $user = Auth::user();
        $roles = $user ? $user->memberships()->pluck('role', 'team_id')->all() : [];

        return $rfcs->map(function ($rfc) use ($user, $roles) {
            $role = $roles[$rfc['team_id']] ?? null;
            $isAdmin = in_array($role, ['owner', 'admin'], true);
            $isAuthor = $user && $rfc['user_id'] === $user->id;

            $rfc['can'] = [
                'update' => (bool) ($isAuthor || $isAdmin),
                'delete' => (bool) ($isAuthor || $isAdmin),
                'change_status' => (bool) ($isAdmin || ($isAuthor && in_array($rfc['status'], ['draft', 'review'], true))),
                'respond' => (bool) ($user && collect($rfc['reviewers'] ?? [])->contains(fn ($r) => $r['id'] === $user->id && $r['status'] === 'pending')),
            ];

            return $rfc;
        });
    }

    public function create()
    {
        return Inertia::render('Rfcs/Create');
    }

    public function store(RfcRequest $request)
    {
        $validated = $request->validated();

        $contentData = collect($validated)->except('title', 'summary', 'tags')->filter()->toArray();

        $content = json_encode($contentData);

        $rfc = request()->user()->rfcs()->create([
            'title' => $validated['title'],
            'summary' => $validated['summary'],
            'slug' => $this->uniqueSlug($validated['title']),
            'content' => $content,
            'team_id' => $this->resolveTeamFor(request()->user())->id,
            'status' => Rfc::STATUS_DRAFT,
        ]);

        if (isset($validated['tags'])) {
            $tags = collect($validated['tags'])->map(function ($tagName) {
                return Tag::firstOrCreate(['name' => $tagName]);
            });

            $rfc->tags()->attach($tags->pluck('id'));
        }

        return redirect()->route('rfcs.index')->with('success', 'RFC submitted successfully!');
    }

    public function show(Rfc $rfc)
    {
        $transformedRfc = $rfc->load(['user', 'comments.user', 'tags', 'decisionRecords.decider', 'reviewRequests.reviewer', 'team'])->loadVoteCounts()->transform();

        $tags = Config::get('constants.tags');
        $sections = Config::get('constants.sections');

        $listQuery = Rfc::withRelations()->withVoteCounts()->latestFirst();

        if (Auth::check()) {
            $teamIds = Auth::user()->memberships()->pluck('team_id')->all();
            if ($teamIds !== []) {
                $listQuery->forTeams($teamIds);
            }
        }

        $rfcs = $this->withPermissions($listQuery->limit(200)->get()->map->transform());
        $transformedRfc = $this->withPermissions(collect([$transformedRfc]))->first();

        return Inertia::render('Rfcs/Index', [
            'rfcs' => $rfcs,
            'initialSelectedRFC' => $transformedRfc,
            'user' => Auth::user(),
            'tags' => $tags,
            'sections' => $sections,
            'teams' => Auth::check() ? $this->teamsFor(Auth::user()) : [],
            'filters' => ['q' => null, 'status' => null, 'stale' => false],
        ]);
    }

    public function edit(Rfc $rfc)
    {
        $this->authorize('update', $rfc);

        return Inertia::render('Rfcs/Edit', ['rfc' => $rfc]);
    }

    public function update(RfcRequest $request, Rfc $rfc)
    {
        $this->authorize('update', $rfc);
        $validated = $request->validated();

        $contentData = collect($validated)->except('title', 'summary', 'tags')->filter()->toArray();

        $content = json_encode($contentData);

        $previousStatus = $rfc->status;

        $rfc->update([
            'title' => $validated['title'],
            'summary' => $validated['summary'],
            'content' => $content,
            'slug' => $this->uniqueSlug($validated['title'], $rfc->id),
        ]);

        if ($previousStatus !== Rfc::STATUS_DRAFT) {
            $rfc->update(['status' => Rfc::STATUS_DRAFT, 'decided_by' => null, 'decided_at' => null]);

            \App\Models\RfcTransition::create([
                'rfc_id' => $rfc->id,
                'from_status' => $previousStatus,
                'to_status' => Rfc::STATUS_DRAFT,
                'actor_id' => $request->user()->id,
                'comment' => 'Content edited, sent back for review.',
            ]);
        }

        $rfc->increment('version');

        if (isset($validated['tags'])) {
            $tags = collect($validated['tags'])->map(function ($tagName) {
                return Tag::firstOrCreate(['name' => $tagName]);
            });

            $rfc->tags()->sync($tags->pluck('id'));
        }

        return redirect(route('rfcs.show', $rfc));
    }

    public function destroy(Rfc $rfc)
    {
        $this->authorize('delete', $rfc);
        $rfc->delete();

        return redirect(route('rfcs.index'));
    }

    private function teamsFor(\App\Models\User $user)
    {
        return $user->teams()
            ->select('teams.id', 'teams.name', 'teams.slug', 'teams.plan', 'teams.seats_limit', 'teams.approval_quorum')
            ->with(['members' => fn ($q) => $q->select('users.id', 'users.name', 'users.email')])
            ->get();
    }

    private function resolveTeamFor(\App\Models\User $user): \App\Models\Team
    {
        $teamId = $user->memberships()->orderBy('id')->value('team_id');

        if ($teamId) {
            return \App\Models\Team::findOrFail($teamId);
        }

        $team = \App\Models\Team::create([
            'name' => $user->name."'s team",
            'slug' => \Illuminate\Support\Str::slug($user->name).'-'.$user->id,
            'owner_id' => $user->id,
        ]);
        $team->memberships()->create(['user_id' => $user->id, 'role' => \App\Models\Membership::ROLE_OWNER]);

        return $team;
    }

    private function uniqueSlug(string $title, ?int $ignoreId = null): string
    {
        $base = Str::slug($title);
        if ($base === '') {
            $base = 'rfc';
        }

        $slug = $base;
        $i = 2;
        while (Rfc::where('slug', $slug)->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $slug = "{$base}-{$i}";
            $i++;
        }

        return $slug;
    }

    public function vote(Request $request, Rfc $rfc)
    {
        $validated = $request->validate([
            'type' => 'required|in:upvote,downvote',
        ]);
        $type = $validated['type'];
        $userId = Auth::id();

        $existingVote = Vote::byUserAndRfc($userId, $rfc->id)->first();

        if ($existingVote && $existingVote->type === $type) {
            $existingVote->delete();

            return response()->json([
                'message' => 'Vote removed.',
                'upvotes' => Vote::byRfc($rfc->id)->Upvotes()->count(),
                'downvotes' => Vote::byRfc($rfc->id)->Downvotes()->count(),
            ]);
        }

        Vote::updateOrCreate(
            ['user_id' => $userId, 'rfc_id' => $rfc->id],
            ['type' => $type]
        );

        return response()->json([
            'message' => $existingVote ? 'Vote updated.' : 'Vote added.',
            'upvotes' => Vote::byRfc($rfc->id)->Upvotes()->count(),
            'downvotes' => Vote::byRfc($rfc->id)->Downvotes()->count(),
        ], 200);
    }
}
