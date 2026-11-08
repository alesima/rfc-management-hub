<?php

namespace App\Http\Controllers;

use App\Models\Rfc;
use App\Models\RfcTransition;
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
