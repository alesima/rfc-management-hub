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
}
