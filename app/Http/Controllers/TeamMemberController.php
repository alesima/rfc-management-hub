<?php

namespace App\Http\Controllers;

use App\Models\Membership;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\Request;

class TeamMemberController extends Controller
{
    public function store(Request $request, Team $team)
    {
        $this->authorize('manageMembers', $team);

        $validated = $request->validate([
            'email' => 'required|email|exists:users,email',
            'role' => 'required|in:'.implode(',', [Membership::ROLE_OWNER, Membership::ROLE_ADMIN, Membership::ROLE_MEMBER]),
        ]);

        $user = User::where('email', $validated['email'])->firstOrFail();
        $existing = $team->memberships()->where('user_id', $user->id)->first();

        if (! $existing && $team->memberships()->count() >= $team->seats_limit) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Seat limit reached for this team.'], 402);
            }

            return back()->withErrors(['email' => 'Seat limit reached for this team.']);
        }

        if ($existing && $this->isLastOwner($team, $existing) && $validated['role'] !== Membership::ROLE_OWNER) {
            return back()->withErrors(['role' => 'Cannot demote the last owner.']);
        }

        $team->memberships()->updateOrCreate(
            ['user_id' => $user->id],
            ['role' => $validated['role']]
        );

        return back()->with('success', "{$user->name} added to {$team->name}.");
    }

    public function destroy(Request $request, Team $team, User $user)
    {
        $this->authorize('manageMembers', $team);

        $membership = $team->memberships()->where('user_id', $user->id)->firstOrFail();

        if ($this->isLastOwner($team, $membership)) {
            return back()->withErrors(['email' => 'Cannot remove the last owner.']);
        }

        $membership->delete();

        return back()->with('success', "{$user->name} removed from {$team->name}.");
    }

    private function isLastOwner(Team $team, Membership $membership): bool
    {
        return $membership->role === Membership::ROLE_OWNER
            && $team->memberships()->where('role', Membership::ROLE_OWNER)->count() <= 1;
    }
}
