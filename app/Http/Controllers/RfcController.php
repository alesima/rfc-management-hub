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
    public function index()
    {
        $rfcs = Rfc::with(['user', 'tags'])->latest()->get()->map(function ($rfc) {
            return [
                'id' => $rfc->id,
                'title' => $rfc->title,
                'summary' => $rfc->summary,
                'slug' => $rfc->slug,
                'content' => $rfc->content,
                'username' => $rfc->user->name,
                'tags' => $rfc->tags->pluck('name'),
                'comments' => $rfc->comments->count(),
                'upvotes' => $rfc->votes()->Upvotes()->count(),
                'downvotes' => $rfc->votes()->Downvotes()->count(),
                'created_at' => $rfc->created_at,
                'updated_at' => $rfc->updated_at,
            ];
        });

        $tags = Config::get('constants.tags');
        $sections = Config::get('constants.sections');

        return Inertia::render('Rfcs/Index', [
            'rfcs' => $rfcs,
            'user' => Auth::user(),
            'tags' => $tags,
            'sections' => $sections
        ]);
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
            'slug' => Str::slug($validated['title']),
            'content' => $content,
            'user_id' => Auth::id(),
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
        $rfc->load('user', 'comments.user', 'tags');

        $transformedRfc = [
            'id' => $rfc->id,
            'title' => $rfc->title,
            'summary' => $rfc->summary,
            'slug' => $rfc->slug,
            'content' => $rfc->content,
            'username' => $rfc->user->name,
            'tags' => $rfc->tags->pluck('name'),
            'comments' => $rfc->comments->map(function ($comment) {
                return [
                    'id' => $comment->id,
                    'content' => $comment->content,
                    'username' => $comment->user->name,
                    'created_at' => $comment->created_at,
                ];
            }),
            'upvotes' => $rfc->votes()->Upvotes()->count(),
            'downvotes' => $rfc->votes()->Downvotes()->count(),
            'version' => $rfc->version,
            'created_at' => $rfc->created_at,
            'updated_at' => $rfc->updated_at,
        ];

        $tags = Config::get('constants.tags');
        $sections = Config::get('constants.sections');

        $rfcs = Rfc::with(['user', 'tags'])->latest()->get()->map(function ($rfc) {
            return [
                'id' => $rfc->id,
                'title' => $rfc->title,
                'summary' => $rfc->summary,
                'slug' => $rfc->slug,
                'content' => $rfc->content,
                'username' => $rfc->user->name,
                'tags' => $rfc->tags->pluck('name'),
                'comments' => $rfc->comments->count(),
                'upvotes' => $rfc->votes()->Upvotes()->count(),
                'downvotes' => $rfc->votes()->Downvotes()->count(),
                'created_at' => $rfc->created_at,
                'updated_at' => $rfc->updated_at,
            ];
        });

        return Inertia::render('Rfcs/Index', [
            'rfcs' => $rfcs,
            'initialSelectedRFC' => $transformedRfc,
            'user' => Auth::user(),
            'tags' => $tags,
            'sections' => $sections
        ]);
    }

    public function edit(Rfc $rfc)
    {
        return Inertia::render('Rfcs/Edit', ['rfc' => $rfc]);
    }

    public function update(RfcRequest $request, Rfc $rfc)
    {
        $validated = $request->validated();

        $contentData = collect($validated)->except('title', 'summary', 'tags')->filter()->toArray();
        $content = json_encode($contentData);

        $rfc->update([
            'title' => $validated['title'],
            'summary' => $validated['summary'],
            'content' => $content,
            'slug' => Str::slug($validated['title']),
        ]);

        $rfc->increment('version');

        if (isset($validated['tags'])) {
            $tags = collect($validated['tags'])->map(function ($tagName) {
                return Tag::firstOrCreate(['name' => $tagName]);
            });

            $rfc->tags()->attach($tags->pluck('id'));
        }

        return redirect(route('rfcs.show', $rfc));
    }

    public function destroy(Rfc $rfc)
    {
        $rfc->delete();
        return redirect(route('rfcs.index'));
    }

    public function vote(Request $request, Rfc $rfc)
    {
        $userId = Auth::id();
        $type = $request->input('type'); // 'upvote' or 'downvote'

        $existingVote = Vote::byUserAndRfc($userId, $rfc->id)->first();

        if ($existingVote && $existingVote->type === $type) {
            $existingVote->delete();
            return [
                'message' => 'Vote removed.',
                'upvotes' => Vote::byRfc($rfc->id)->Upvotes()->count(),
                'downvotes' => Vote::byRfc($rfc->id)->Downvotes()->count(),
            ];
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
