<?php

namespace Tests\Feature;

use App\Models\Membership;
use App\Models\Rfc;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ReviewDueDateTest extends TestCase
{
    use RefreshDatabase;

    private function teamWithOwner(User $owner): Team
    {
        $team = Team::create(['name' => 'Core', 'slug' => 'core-'.$owner->id, 'owner_id' => $owner->id]);
        $team->memberships()->create(['user_id' => $owner->id, 'role' => Membership::ROLE_OWNER]);

        return $team;
    }

    public function test_store_persists_due_date_outside_content(): void
    {
        $user = User::factory()->create();
        $this->teamWithOwner($user);

        $this->actingAs($user)->post(route('rfcs.store'), [
            'title' => 'Dated RFC',
            'summary' => 'S',
            'motivation' => 'M',
            'review_due_at' => now()->addDays(5)->toDateString(),
        ])->assertRedirect();

        $rfc = Rfc::first();
        $this->assertSame(now()->addDays(5)->toDateString(), $rfc->review_due_at->toDateString());
        $this->assertStringNotContainsString('review_due_at', $rfc->content);
    }

    public function test_overdue_flag_and_stale_filter(): void
    {
        $user = User::factory()->create();
        $team = $this->teamWithOwner($user);
        $rfc = Rfc::create([
            'title' => 'Late review', 'summary' => 'S', 'slug' => 'late-1',
            'content' => json_encode([]),
            'user_id' => $user->id, 'team_id' => $team->id,
            'status' => Rfc::STATUS_REVIEW,
            'review_due_at' => now()->subDay()->toDateString(),
        ]);

        $this->assertTrue($rfc->fresh()->isOverdue());

        $this->get('/rfcs?stale=1')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('rfcs', 1)
                ->where('rfcs.0.is_overdue', true));
    }

    public function test_reminder_command_lists_overdue(): void
    {
        $user = User::factory()->create();
        $team = $this->teamWithOwner($user);
        Rfc::create([
            'title' => 'Late review', 'summary' => 'S', 'slug' => 'late-2',
            'content' => json_encode([]),
            'user_id' => $user->id, 'team_id' => $team->id,
            'status' => Rfc::STATUS_REVIEW,
            'review_due_at' => now()->subDay()->toDateString(),
        ]);

        $exit = Artisan::call('rfcs:due-reminders');
        $output = Artisan::output();

        $this->assertSame(0, $exit);
        $this->assertStringContainsString('OVERDUE', $output);
        $this->assertStringContainsString('Late review', $output);
    }
}
