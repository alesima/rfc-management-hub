<?php

namespace App\Http\Controllers;

use App\Models\Team;
use Illuminate\Http\Request;

class TeamSettingsController extends Controller
{
    public function update(Request $request, Team $team)
    {
        $this->authorize('manageMembers', $team);

        $validated = $request->validate([
            'approval_quorum' => 'required|integer|min:1|max:10',
            'slack_webhook_url' => 'nullable|url|max:500',
            'teams_webhook_url' => 'nullable|url|max:500',
        ]);

        $team->update($validated);

        return back()->with('success', 'Review settings updated.');
    }
}
