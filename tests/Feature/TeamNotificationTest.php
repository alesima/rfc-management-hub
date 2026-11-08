<?php

namespace Tests\Feature;

use App\Models\Membership;
use App\Models\Rfc;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class TeamNotificationTest extends TestCase
{
    use RefreshDatabase;

    private function teamWithOwner(User $owner, array $over = []): Team
    {
        $team = Team::create(array_merge([
            'name' => 'Core', 'slug' => 'core-'.$owner->id, 'owner_id' => $owner->id,
        ], $over));
        $team->memberships()->create(['user_id' => $owner->id, 'role' => Membership::ROLE_OWNER]);

        return $team;
    }

    public function test_status_change_posts_to_slack(): void
    {
        Http::fake();
        $owner = User::factory()->create();
        $team = $this->teamWithOwner($owner, ['slack_webhook_url' => 'https://hooks.slack.com/test']);
        $rfc = Rfc::create([
            'title' => 'Hooked RFC', 'summary' => 'S', 'slug' => 'hooked-1',
            'content' => json_encode([]),
            'user_id' => $owner->id, 'team_id' => $team->id, 'status' => Rfc::STATUS_REVIEW,
        ]);

        $this->actingAs($owner)
            ->patch(route('rfcs.status.update', $rfc), ['to_status' => 'approved'])
            ->assertRedirect();

        Http::assertSent(function ($request) {
            return $request->url() === 'https://hooks.slack.com/test'
                && str_contains($request['text'] ?? '', 'Hooked RFC')
                && str_contains($request['text'] ?? '', 'approved');
        });
    }

    public function test_status_change_posts_teams_card(): void
    {
        Http::fake();
        $owner = User::factory()->create();
        $team = $this->teamWithOwner($owner, ['teams_webhook_url' => 'https://outlook.office.com/test']);
        $rfc = Rfc::create([
            'title' => 'Teams RFC', 'summary' => 'S', 'slug' => 'teams-1',
            'content' => json_encode([]),
            'user_id' => $owner->id, 'team_id' => $team->id, 'status' => Rfc::STATUS_REVIEW,
        ]);

        $this->actingAs($owner)
            ->patch(route('rfcs.status.update', $rfc), ['to_status' => 'rejected']);

        Http::assertSent(function ($request) {
            return $request->url() === 'https://outlook.office.com/test'
                && ($request['@type'] ?? null) === 'MessageCard';
        });
    }

    public function test_no_webhook_sends_nothing(): void
    {
        Http::fake();
        $owner = User::factory()->create();
        $team = $this->teamWithOwner($owner);
        $rfc = Rfc::create([
            'title' => 'Quiet RFC', 'summary' => 'S', 'slug' => 'quiet-1',
            'content' => json_encode([]),
            'user_id' => $owner->id, 'team_id' => $team->id, 'status' => Rfc::STATUS_REVIEW,
        ]);

        $this->actingAs($owner)
            ->patch(route('rfcs.status.update', $rfc), ['to_status' => 'approved']);

        Http::assertNothingSent();
    }

    public function test_store_notifies_on_create(): void
    {
        Http::fake();
        $owner = User::factory()->create();
        $this->teamWithOwner($owner, ['slack_webhook_url' => 'https://hooks.slack.com/test']);

        $this->actingAs($owner)->post(route('rfcs.store'), [
            'title' => 'Fresh RFC', 'summary' => 'S', 'motivation' => 'M',
        ])->assertRedirect();

        Http::assertSent(function ($request) {
            return $request->url() === 'https://hooks.slack.com/test'
                && str_contains($request['text'] ?? '', 'Fresh RFC');
        });
    }

    public function test_settings_save_and_validate_webhooks(): void
    {
        $owner = User::factory()->create();
        $team = $this->teamWithOwner($owner);

        $this->actingAs($owner)->patch(route('teams.settings.update', $team), [
            'approval_quorum' => 1,
            'slack_webhook_url' => 'https://hooks.slack.com/test',
            'teams_webhook_url' => 'https://outlook.office.com/test',
        ])->assertRedirect();

        $fresh = $team->fresh();
        $this->assertSame('https://hooks.slack.com/test', $fresh->slack_webhook_url);
        $this->assertSame('https://outlook.office.com/test', $fresh->teams_webhook_url);

        $this->actingAs($owner)->patch(route('teams.settings.update', $team), [
            'approval_quorum' => 1,
            'slack_webhook_url' => 'not-a-url',
        ])->assertSessionHasErrors('slack_webhook_url');
    }
}
