<?php

namespace App\Console\Commands;

use App\Models\Rfc;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SendDueReminders extends Command
{
    protected $signature = 'rfcs:due-reminders';

    protected $description = 'List reviews that are overdue or due soon so they can be nudged';

    public function handle(): int
    {
        $overdue = Rfc::with('user')
            ->where('status', Rfc::STATUS_REVIEW)
            ->whereNotNull('review_due_at')
            ->where('review_due_at', '<', now())
            ->orderBy('review_due_at')
            ->get();

        $dueSoon = Rfc::with('user')
            ->where('status', Rfc::STATUS_REVIEW)
            ->whereNotNull('review_due_at')
            ->whereBetween('review_due_at', [now(), now()->addDays(2)])
            ->orderBy('review_due_at')
            ->get();

        foreach ($overdue as $rfc) {
            $line = "OVERDUE: #{$rfc->id} {$rfc->title} (due {$rfc->review_due_at->toDateString()}, author {$rfc->user?->name})";
            $this->warn($line);
            Log::warning($line);
        }

        foreach ($dueSoon as $rfc) {
            $line = "DUE SOON: #{$rfc->id} {$rfc->title} (due {$rfc->review_due_at->toDateString()}, author {$rfc->user?->name})";
            $this->line($line);
            Log::info($line);
        }

        $this->info("{$overdue->count()} overdue, {$dueSoon->count()} due soon.");

        return self::SUCCESS;
    }
}
