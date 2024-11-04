<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vote extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'rfc_id',
        'type',
    ];

    public function rfc()
    {
        return $this->belongsTo(Rfc::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function scopeByRfc($query, $rfcId)
    {
        return $query->where('rfc_id', $rfcId);
    }

    public function scopeByUserAndRfc($query, $userId, $rfcId)
    {
        return $query->where('user_id', $userId)->where('rfc_id', $rfcId);
    }

    public function scopeUpvotes($query)
    {
        return $query->where('type', 'upvote');
    }

    public function scopeDownvotes($query)
    {
        return $query->where('type', 'downvote');
    }
}
