<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ReviewRequest extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'pending';

    public const STATUS_APPROVED = 'approved';

    public const STATUS_CHANGES_REQUESTED = 'changes_requested';

    protected $fillable = ['rfc_id', 'user_id', 'status'];

    public function rfc()
    {
        return $this->belongsTo(Rfc::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
