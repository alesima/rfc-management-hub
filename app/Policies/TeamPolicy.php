<?php

namespace App\Policies;

use App\Models\Team;
use App\Models\User;

class TeamPolicy
{
    public function manageMembers(User $user, Team $team): bool
    {
        return $team->isAdmin($user);
    }
}
