<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RfcTransition extends Model
{
    use HasFactory;

    protected $fillable = ['rfc_id', 'from_status', 'to_status', 'actor_id', 'comment'];

    public function rfc()
    {
        return $this->belongsTo(Rfc::class);
    }

    public function actor()
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}
