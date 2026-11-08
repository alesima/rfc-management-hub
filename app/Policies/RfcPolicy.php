<?php

namespace App\Policies;

use App\Models\Rfc;
use App\Models\User;

class RfcPolicy
{
    public function viewAny(?User $user): bool
    {
        return true;
    }

    public function view(?User $user, Rfc $rfc): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Rfc $rfc): bool
    {
        if ($rfc->user_id === $user->id) {
            return true;
        }

        return $rfc->team !== null && $rfc->team->isAdmin($user);
    }

    public function delete(User $user, Rfc $rfc): bool
    {
        return $this->update($user, $rfc);
    }

    public function changeStatus(User $user, Rfc $rfc): bool
    {
        if ($rfc->team !== null && $rfc->team->isAdmin($user)) {
            return true;
        }

        // Author may request review (draft -> review) or pull back (review -> draft).
        if ($rfc->user_id !== $user->id) {
            return false;
        }

        return in_array($rfc->status, [Rfc::STATUS_DRAFT, Rfc::STATUS_REVIEW], true);
    }
}
