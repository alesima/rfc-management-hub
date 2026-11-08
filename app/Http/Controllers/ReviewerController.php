<?php

namespace App\Http\Controllers;

use App\Models\ReviewRequest;
use App\Models\Rfc;
use App\Models\User;
use Illuminate\Http\Request;

class ReviewerController extends Controller
{
    public function store(Request $request, Rfc $rfc)
    {
        $this->authorize('update', $rfc);

        $validated = $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $reviewer = User::where('email', $validated['email'])->firstOrFail();

        if ($rfc->team !== null && ! $rfc->team->isMember($reviewer)) {
            return back()->withErrors(['email' => 'Reviewer must be a team member.']);
        }

        if ($reviewer->id === $rfc->user_id) {
            return back()->withErrors(['email' => 'The author cannot review their own RFC.']);
        }

        ReviewRequest::firstOrCreate(
            ['rfc_id' => $rfc->id, 'user_id' => $reviewer->id],
            ['status' => ReviewRequest::STATUS_PENDING]
        );

        return back()->with('success', "{$reviewer->name} requested to review.");
    }

    public function update(Request $request, Rfc $rfc, User $user)
    {
        $review = $rfc->reviewRequests()->where('user_id', $user->id)->firstOrFail();

        if ($request->user()->id !== $user->id) {
            $this->authorize('update', $rfc);
        }

        $validated = $request->validate([
            'status' => 'required|in:'.implode(',', [ReviewRequest::STATUS_APPROVED, ReviewRequest::STATUS_CHANGES_REQUESTED]),
        ]);

        $review->update(['status' => $validated['status']]);

        return back();
    }

    public function destroy(Request $request, Rfc $rfc, User $user)
    {
        $this->authorize('update', $rfc);

        $rfc->reviewRequests()->where('user_id', $user->id)->delete();

        return back();
    }
}
