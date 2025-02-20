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
        'version'
    ];

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

    public function scopeWithRelations()
    {
        return $this->with(['user', 'comments.user', 'tags']);
    }

    public function scopeLatestFirst($query)
    {
        return $query->orderBy('created_at', 'desc');
    }

    public function scopeContainsTitle($query, $title)
    {
        return $query->where('title', 'like', '%' . $title . '%');
    }

    public function scopeWithTag($query, $tagName)
    {
        return $query->whereHas('tags', function ($query) use ($tagName) {
            $query->where('name', $tagName);
        });
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
            'upvotes' => $this->votes()->Upvotes()->count(),
            'downvotes' => $this->votes()->Downvotes()->count(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
