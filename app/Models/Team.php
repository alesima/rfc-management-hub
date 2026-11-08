<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Team extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug', 'owner_id', 'plan', 'seats_limit', 'approval_quorum', 'slack_webhook_url', 'teams_webhook_url'];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function memberships()
    {
        return $this->hasMany(Membership::class);
    }

    public function members()
    {
        return $this->belongsToMany(User::class, 'memberships')->withPivot('role')->withTimestamps();
    }

    public function rfcs()
    {
        return $this->hasMany(Rfc::class);
    }

    public function isAdmin(User $user): bool
    {
        return $this->memberships()->where('user_id', $user->id)->whereIn('role', ['owner', 'admin'])->exists();
    }

    public function isMember(User $user): bool
    {
        return $this->memberships()->where('user_id', $user->id)->exists();
    }
}
