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
        $rfcs = Rfc::withRelations()->latestFirst()->get()->map->transform();

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
        $transformedRfc = $rfc->load(['user', 'comments.user', 'tags'])->transform();

        $tags = Config::get('constants.tags');
        $sections = Config::get('constants.sections');

        $rfcs = Rfc::withRelations()->latestFirst()->get()->map->transform();

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

            $rfc->tags()->sync($tags->pluck('id'));
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
