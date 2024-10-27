<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    use HasFactory;

    protected $fillable = [
        'content',
        'user_id',
        'rfc_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function rfc()
    {
        return $this->belongsTo(Rfc::class);
    }
}
