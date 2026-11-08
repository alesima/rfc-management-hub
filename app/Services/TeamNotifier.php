<?php

namespace App\Services;

use App\Models\Rfc;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TeamNotifier
{
    public static function rfcCreated(Rfc $rfc): void
    {
        $title = "New RFC submitted: {$rfc->title}";
        $text = "New RFC submitted: *{$rfc->title}* by {$rfc->user?->name}";

        self::post($rfc, $title, $text);
    }

    public static function statusChanged(Rfc $rfc, string $from, string $to, ?string $actorName): void
    {
        $by = $actorName ? " by {$actorName}" : '';
        $title = "RFC {$rfc->title} moved to {$to}";
        $text = "RFC *{$rfc->title}* moved from *{$from}* to *{$to}*{$by}";

        self::post($rfc, $title, $text);
    }

    private static function post(Rfc $rfc, string $title, string $text): void
    {
        $team = $rfc->team;

        if ($team?->slack_webhook_url) {
            self::send($team->slack_webhook_url, ['text' => $text]);
        }

        if ($team?->teams_webhook_url) {
            self::send($team->teams_webhook_url, [
                '@type' => 'MessageCard',
                '@context' => 'http://schema.org/extensions',
                'themeColor' => '4F46E5',
                'summary' => $title,
                'sections' => [['activityTitle' => $title, 'text' => strip_tags($text)]],
            ]);
        }
    }

    private static function send(string $url, array $payload): void
    {
        try {
            Http::timeout(5)->post($url, $payload);
        } catch (\Throwable $e) {
            Log::warning('Team notification failed: '.$e->getMessage());
        }
    }
}
