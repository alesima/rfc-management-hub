<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

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
        'review_due_at',
        'version',
    ];

    protected function casts(): array
    {
        return ['review_due_at' => 'date'];
    }

    protected static function booted(): void
    {
        static::saved(fn (Rfc $rfc) => $rfc->syncSearchIndex());
        static::deleted(fn (Rfc $rfc) => $rfc->removeFromSearchIndex());
    }

    public const STATUS_DRAFT = 'draft';

    public const STATUS_REVIEW = 'review';

    public const STATUS_APPROVED = 'approved';

    public const STATUS_REJECTED = 'rejected';

    public const STATUS_ARCHIVED = 'archived';

    public const STALE_AFTER_DAYS = 14;

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

    public function decisionRecords()
    {
        return $this->hasMany(DecisionRecord::class)->orderByDesc('decided_at')->orderByDesc('id');
    }

    public function reviewRequests()
    {
        return $this->hasMany(ReviewRequest::class);
    }

    public function quorumProgress(): array
    {
        $requested = $this->reviewRequests->count();
        $approvals = $this->reviewRequests->where('status', ReviewRequest::STATUS_APPROVED)->count();
        $changes = $this->reviewRequests->where('status', ReviewRequest::STATUS_CHANGES_REQUESTED)->count();
        $required = $requested > 0 ? min($this->team?->approval_quorum ?? 1, $requested) : 0;

        return [
            'requested' => $requested,
            'approvals' => $approvals,
            'changes_requested' => $changes,
            'required' => $required,
            'blocking' => $requested > 0 && ($changes > 0 || $approvals < $required),
        ];
    }

    public function isOverdue(): bool
    {
        return $this->status === self::STATUS_REVIEW
            && $this->review_due_at !== null
            && $this->review_due_at->isPast();
    }

    public function extractSearchText(): array
    {
        $sections = json_decode($this->content ?? '', true);
        $body = is_array($sections)
            ? implode("\n", array_filter(array_map('strval', array_values($sections))))
            : (string) $this->content;

        $decisions = $this->relationLoaded('decisionRecords')
            ? $this->decisionRecords->pluck('title')->all()
            : $this->decisionRecords()->pluck('title')->all();

        return [
            'title' => (string) $this->title,
            'summary' => (string) $this->summary,
            'body' => trim($body."\n".implode("\n", $decisions)),
        ];
    }

    public function syncSearchIndex(): void
    {
        if (! Schema::hasTable('rfc_search')) {
            return;
        }

        $text = $this->extractSearchText();

        DB::table('rfc_search')->updateOrInsert(
            ['rfc_id' => $this->id],
            ['title' => $text['title'], 'summary' => $text['summary'], 'body' => $text['body']]
        );
    }

    public function removeFromSearchIndex(): void
    {
        if (! Schema::hasTable('rfc_search')) {
            return;
        }

        DB::table('rfc_search')->where('rfc_id', $this->id)->delete();
    }

    public function scopeSearch($query, string $term)
    {
        $fts = self::buildFtsQuery($term);

        if ($fts === null) {
            return $query->where(function ($q) use ($term) {
                $q->where('title', 'like', '%'.$term.'%')
                    ->orWhere('summary', 'like', '%'.$term.'%');
            });
        }

        try {
            return $query
                ->join('rfc_search', 'rfcs.id', '=', 'rfc_search.rfc_id')
                ->whereRaw('rfc_search MATCH ?', [$fts])
                ->orderByRaw('bm25(rfc_search)')
                ->select('rfcs.*');
        } catch (\Exception $e) {
            return $query->where(function ($q) use ($term) {
                $q->where('title', 'like', '%'.$term.'%')
                    ->orWhere('summary', 'like', '%'.$term.'%');
            });
        }
    }

    public static function buildFtsQuery(string $term): ?string
    {
        $tokens = preg_split('/\s+/', mb_strtolower($term));
        $tokens = array_filter(array_map(function ($t) {
            $t = trim($t, "\"'*.:()^\"");
            $t = preg_replace('/[^a-z0-9@._-]/u', '', $t);

            return $t !== '' ? '"'.$t.'"*' : null;
        }, $tokens ?: []));

        return $tokens === [] ? null : implode(' ', $tokens);
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
        return $query->with(['user', 'comments.user', 'tags', 'decisionRecords.decider', 'reviewRequests.reviewer', 'team']);
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
            'review_due_at' => $this->review_due_at?->toDateString(),
            'is_overdue' => $this->isOverdue(),
            'is_stale' => $this->status === self::STATUS_REVIEW
                && $this->updated_at !== null
                && $this->updated_at->lt(now()->subDays(self::STALE_AFTER_DAYS)),
            'decision' => $this->decisionRecords->first() ? [
                'status' => $this->decisionRecords->first()->status,
                'rfc_version' => $this->decisionRecords->first()->rfc_version,
                'decided_by' => $this->decisionRecords->first()->decider?->name,
                'decided_at' => $this->decisionRecords->first()->decided_at,
            ] : null,
            'reviewers' => $this->reviewRequests->map(fn ($r) => [
                'id' => $r->user_id,
                'name' => $r->reviewer?->name,
                'status' => $r->status,
            ])->values(),
            'quorum' => $this->quorumProgress(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
