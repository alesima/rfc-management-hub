<?php

namespace App\Http\Controllers;

use App\Models\Rfc;
use App\Models\Tag;
use App\Models\Vote;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class RfcController extends Controller
{
    public function index()
    {
        $rfcs = Rfc::with(['user', 'tags'])->latest()->get()->map(function ($rfc) {
            return [
                'id' => $rfc->id,
                'title' => $rfc->title,
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

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|max:255',
            'summary' => 'nullable',
            'motivation' => 'nullable',
            'proposal' => 'nullable',
            'impact_analysis' => 'nullable',
            'implementation_plan' => 'nullable',
            'design_constraints' => 'nullable',
            'alternatives_considered' => 'nullable',
            'security_considerations' => 'nullable',
            'performance_considerations' => 'nullable',
            'testing_strategy' => 'nullable',
            'deployment_plan' => 'nullable',
            'compatibility' => 'nullable',
            'dependencies' => 'nullable',
            'operational_impact' => 'nullable',
            'compliance_and_legal' => 'nullable',
            'resources_required' => 'nullable',
            'end_user_documentation' => 'nullable',
            'references' => 'nullable',
            'tags' => 'array'
        ]);

        $contentData = collect([
            'summary' => $validated['summary'] ?? null,
            'motivation' => $validated['motivation'] ?? null,
            'proposal' => $validated['proposal'] ?? null,
            'impactAnalysis' => $validated['impact_analysis'] ?? null,
            'implementationPlan' => $validated['implementation_plan'] ?? null,
            'designConstraints' => $validated['design_constraints'] ?? null,
            'alternativesConsidered' => $validated['alternatives_considered'] ?? null,
            'securityConsiderations' => $validated['security_considerations'] ?? null,
            'performanceConsiderations' => $validated['performance_considerations'] ?? null,
            'testingStrategy' => $validated['testing_strategy'] ?? null,
            'deploymentPlan' => $validated['deployment_plan'] ?? null,
            'compatibility' => $validated['compatibility'] ?? null,
            'dependencies' => $validated['dependencies'] ?? null,
            'operationalImpact' => $validated['operational_impact'] ?? null,
            'complianceAndLegal' => $validated['compliance_and_legal'] ?? null,
            'resourcesRequired' => $validated['resources_required'] ?? null,
            'endUserDocumentation' => $validated['end_user_documentation'] ?? null,
            'references' => $validated['references'] ?? null,
        ])->filter()->toArray();

        $content = json_encode($contentData);

        $rfc = request()->user()->rfcs()->create([
            'title' => $validated['title'],
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

        $rfcs = Rfc::with(['user', 'tags'])->latest()->get()->map(function ($rfc) {
            return [
                'id' => $rfc->id,
                'title' => $rfc->title,
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
                'created_at' => $rfc->created_at,
                'updated_at' => $rfc->updated_at,
            ];
        });

        $tags = Config::get('constants.tags');
        $sections = Config::get('constants.sections');

        $transformedRfc = [
            'id' => $rfc->id,
            'title' => $rfc->title,
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

    public function update(Request $request, Rfc $rfc)
    {
        $validated = $request->validate([
            'title' => 'required|max:255',
            'content' => 'required',
        ]);

        $rfc->update($validated);
        $rfc->increment('version');

        return redirect(route('rfcs.show', $rfc));
    }

    public function destroy(Rfc $rfc)
    {
        $rfc->delete();
        return redirect(route('rfcs.index'));
    }

    public function vote(Request $request, Rfc $rfc)
    {
        $user = Auth::user();
        $type = $request->input('type'); // 'upvote' or 'downvote'

        $existingVote = Vote::where('user_id', $user->id)
            ->where('rfc_id', $rfc->id)
            ->first();

        if ($existingVote && $existingVote->type === $type) {
            $existingVote->delete();
            $message = 'Vote removed.';
        } elseif ($existingVote) {
            $existingVote->update(['type' => $type]);
            $message = 'Vote updated.';
        } else {
            Vote::create([
                'user_id' => $user->id,
                'rfc_id' => $rfc->id,
                'type' => $type,
            ]);
            $message = 'Vote added.';
        }

        $upvotes = Vote::where('rfc_id', $rfc->id)->where('type', 'upvote')->count();
        $downvotes = Vote::where('rfc_id', $rfc->id)->where('type', 'downvote')->count();

        return response()->json([
            'message' => $message,
            'upvotes' => $upvotes,
            'downvotes' => $downvotes,
        ], 200);
    }
}
