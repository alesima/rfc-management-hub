<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DecisionRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'rfc_id',
        'title',
        'summary',
        'content',
        'status',
        'rfc_version',
        'decided_by',
        'decided_at',
    ];

    protected function casts(): array
    {
        return ['decided_at' => 'datetime'];
    }

    protected static function booted(): void
    {
        static::created(fn (DecisionRecord $record) => $record->rfc?->syncSearchIndex());
    }

    public function rfc()
    {
        return $this->belongsTo(Rfc::class);
    }

    public function decider()
    {
        return $this->belongsTo(User::class, 'decided_by');
    }

    public function toMarkdown(): string
    {
        $lines = [
            "# ADR: {$this->title}",
            '',
            "- Status: {$this->status}",
            '- Date: '.($this->decided_at?->toDateString() ?? now()->toDateString()),
            "- RFC version: {$this->rfc_version}",
            '- Decided by: '.($this->decider?->name ?? 'unknown'),
            '',
        ];

        if ($this->summary) {
            $lines[] = $this->summary;
            $lines[] = '';
        }

        $lines[] = '## Context';
        $lines[] = '';
        $lines[] = $this->renderedContent();

        return implode("\n", $lines)."\n";
    }

    private function renderedContent(): string
    {
        $sections = json_decode($this->content, true);

        if (! is_array($sections)) {
            return (string) $this->content;
        }

        $out = [];
        foreach ($sections as $name => $body) {
            if ($body === null || $body === '') {
                continue;
            }
            $out[] = '### '.ucfirst($name);
            $out[] = '';
            $out[] = (string) $body;
            $out[] = '';
        }

        return implode("\n", $out);
    }
}
