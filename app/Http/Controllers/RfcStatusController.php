<?php

namespace App\Http\Controllers;

use App\Models\DecisionRecord;
use App\Models\Rfc;
use App\Models\RfcTransition;
use App\Services\TeamNotifier;
use Illuminate\Http\Request;

class RfcStatusController extends Controller
{
    public function update(Request $request, Rfc $rfc)
    {
        $this->authorize('changeStatus', $rfc);

        $validated = $request->validate([
            'to_status' => 'required|in:'.implode(',', Rfc::STATUSES),
            'comment' => 'nullable|string|max:1000',
        ]);
        $to = $validated['to_status'];

        if (! $rfc->canTransitionTo($to)) {
            return back()->withErrors(['to_status' => "Cannot transition from {$rfc->status} to {$to}."]);
        }

        if ($to === Rfc::STATUS_APPROVED && $rfc->quorumProgress()['blocking']) {
            $progress = $rfc->quorumProgress();

            return back()->withErrors(['to_status' => "Blocked: {$progress['approvals']}/{$progress['required']} approvals, {$progress['changes_requested']} change request(s)."]);
        }

        if (! $this->isTeamAdmin($request->user(), $rfc) && ! $this->isAuthorSelfTransition($request->user()->id, $rfc, $to)) {
            abort(403);
        }

        $from = $rfc->status;
        $decided = in_array($to, [Rfc::STATUS_APPROVED, Rfc::STATUS_REJECTED], true);

        $rfc->update([
            'status' => $to,
            'decided_by' => $decided ? $request->user()->id : null,
            'decided_at' => $decided ? now() : null,
        ]);

        RfcTransition::create([
            'rfc_id' => $rfc->id,
            'from_status' => $from,
            'to_status' => $to,
            'actor_id' => $request->user()->id,
            'comment' => $validated['comment'] ?? null,
        ]);

        if ($decided) {
            DecisionRecord::create([
                'rfc_id' => $rfc->id,
                'title' => $rfc->title,
                'summary' => $rfc->summary,
                'content' => $rfc->content,
                'status' => $to,
                'rfc_version' => $rfc->version,
                'decided_by' => $request->user()->id,
                'decided_at' => now(),
            ]);
        }

        TeamNotifier::statusChanged($rfc->fresh(), $from, $to, $request->user()->name);

        return redirect(route('rfcs.show', $rfc));
    }

    private function isTeamAdmin($user, Rfc $rfc): bool
    {
        return $rfc->team === null || $rfc->team->isAdmin($user);
    }

    private function isAuthorSelfTransition(int $userId, Rfc $rfc, string $to): bool
    {
        if ($rfc->user_id !== $userId) {
            return false;
        }

        $allowed = [
            Rfc::STATUS_DRAFT => [Rfc::STATUS_REVIEW],
            Rfc::STATUS_REVIEW => [Rfc::STATUS_DRAFT],
        ];

        return in_array($to, $allowed[$rfc->status] ?? [], true);
    }
}
