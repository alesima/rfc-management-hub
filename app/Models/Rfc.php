<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rfc extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'summary',
        'slug',
        'content',
        'user_id',
        'team_id',
        'status',
        'decided_by',
        'decided_at',
        'version',
    ];

    public const STATUS_DRAFT = 'draft';

    public const STATUS_REVIEW = 'review';

    public const STATUS_APPROVED = 'approved';

    public const STATUS_REJECTED = 'rejected';

    public const STATUS_ARCHIVED = 'archived';

    public const STATUSES = [
        self::STATUS_DRAFT,
        self::STATUS_REVIEW,
        self::STATUS_APPROVED,
        self::STATUS_REJECTED,
        self::STATUS_ARCHIVED,
    ];

    public const TRANSITIONS = [
        self::STATUS_DRAFT => [self::STATUS_REVIEW],
        self::STATUS_REVIEW => [self::STATUS_DRAFT, self::STATUS_APPROVED, self::STATUS_REJECTED],
        self::STATUS_APPROVED => [self::STATUS_ARCHIVED],
        self::STATUS_REJECTED => [self::STATUS_ARCHIVED],
    ];

    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    public function transitions()
    {
        return $this->hasMany(RfcTransition::class)->latest();
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class);
    }

    public function votes()
    {
        return $this->hasMany(Vote::class);
    }

    public function scopeWithRelations($query)
    {
        return $query->with(['user', 'comments.user', 'tags']);
    }

    public function scopeWithVoteCounts($query)
    {
        return $query->withCount([
            'votes as upvotes' => fn ($q) => $q->where('type', 'upvote'),
            'votes as downvotes' => fn ($q) => $q->where('type', 'downvote'),
        ]);
    }

    public function loadVoteCounts()
    {
        return $this->loadCount([
            'votes as upvotes' => fn ($q) => $q->where('type', 'upvote'),
            'votes as downvotes' => fn ($q) => $q->where('type', 'downvote'),
        ]);
    }

    public function scopeLatestFirst($query)
    {
        return $query->orderBy('created_at', 'desc');
    }

    public function scopeContainsTitle($query, $title)
    {
        return $query->where('title', 'like', '%'.$title.'%');
    }

    public function scopeWithTag($query, $tagName)
    {
        return $query->whereHas('tags', function ($query) use ($tagName) {
            $query->where('name', $tagName);
        });
    }

    public function scopeForTeam($query, $teamId)
    {
        return $query->where('team_id', $teamId);
    }

    public function scopeForTeams($query, array $teamIds)
    {
        return $query->whereIn('team_id', $teamIds);
    }

    public function canTransitionTo(string $to): bool
    {
        return in_array($to, self::TRANSITIONS[$this->status] ?? [], true);
    }

    public function transform()
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'summary' => $this->summary,
            'version' => $this->version,
            'slug' => $this->slug,
            'content' => $this->content,
            'team_id' => $this->team_id,
            'user_id' => $this->user_id,
            'status' => $this->status ?? self::STATUS_DRAFT,
            'username' => $this->user->name,
            'tags' => $this->tags->pluck('name'),
            'comments' => $this->comments->map(function ($comment) {
                return [
                    'id' => $comment->id,
                    'content' => $comment->content,
                    'username' => $comment->user->name,
                    'created_at' => $comment->created_at,
                ];
            }),
            'upvotes' => $this->upvotes ?? $this->votes()->Upvotes()->count(),
            'downvotes' => $this->downvotes ?? $this->votes()->Downvotes()->count(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
