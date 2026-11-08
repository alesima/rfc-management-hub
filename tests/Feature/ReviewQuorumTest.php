<?php

namespace Tests\Feature;

use App\Models\Membership;
use App\Models\Rfc;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReviewQuorumTest extends TestCase
{
    use RefreshDatabase;

    private function team(User $owner, int $quorum = 2): Team
    {
        $team = Team::create([
            'name' => 'Core', 'slug' => 'core-'.$owner->id,
            'owner_id' => $owner->id, 'approval_quorum' => $quorum,
        ]);
        $team->memberships()->create(['user_id' => $owner->id, 'role' => Membership::ROLE_OWNER]);

        return $team;
    }

    private function memberOf(Team $team): User
    {
        $user = User::factory()->create();
        $team->memberships()->create(['user_id' => $user->id, 'role' => Membership::ROLE_MEMBER]);

        return $user;
    }

    private function rfcInReview(User $author, Team $team): Rfc
    {
        return Rfc::create([
            'title' => 'T', 'summary' => 'S', 'slug' => 't-'.$author->id.random_int(1, 99999),
            'content' => json_encode([]),
            'user_id' => $author->id, 'team_id' => $team->id, 'status' => Rfc::STATUS_REVIEW,
        ]);
    }

    public function test_request_reviewer_and_approve_blocked_until_quorum(): void
    {
        $owner = User::factory()->create();
        $team = $this->team($owner, 2);
        $rev1 = $this->memberOf($team);
        $rev2 = $this->memberOf($team);
        $rfc = $this->rfcInReview($owner, $team);

        $this->actingAs($owner)->post(route('rfcs.reviewers.store', $rfc), ['email' => $rev1->email])->assertRedirect();
        $this->actingAs($owner)->post(route('rfcs.reviewers.store', $rfc), ['email' => $rev2->email])->assertRedirect();

        // 0/2 → blocked
        $this->actingAs($owner)
            ->patch(route('rfcs.status.update', $rfc), ['to_status' => 'approved'])
            ->assertSessionHasErrors('to_status');
        $this->assertSame('review', $rfc->fresh()->status);

        // 1/2 → still blocked
        $this->actingAs($rev1)->patch(route('rfcs.reviewers.update', [$rfc, $rev1]), ['status' => 'approved']);
        $this->actingAs($owner)
            ->patch(route('rfcs.status.update', $rfc), ['to_status' => 'approved'])
            ->assertSessionHasErrors('to_status');

        // 2/2 → goes through
        $this->actingAs($rev2)->patch(route('rfcs.reviewers.update', [$rfc, $rev2]), ['status' => 'approved']);
        $this->actingAs($owner)
            ->patch(route('rfcs.status.update', $rfc), ['to_status' => 'approved'])
            ->assertRedirect();
        $this->assertSame('approved', $rfc->fresh()->status);
    }

    public function test_changes_requested_blocks_even_with_quorum(): void
    {
        $owner = User::factory()->create();
        $team = $this->team($owner, 1);
        $rev = $this->memberOf($team);
        $rfc = $this->rfcInReview($owner, $team);

        $this->actingAs($owner)->post(route('rfcs.reviewers.store', $rfc), ['email' => $rev->email]);
        $this->actingAs($rev)->patch(route('rfcs.reviewers.update', [$rfc, $rev]), ['status' => 'changes_requested']);

        $this->actingAs($owner)
            ->patch(route('rfcs.status.update', $rfc), ['to_status' => 'approved'])
            ->assertSessionHasErrors('to_status');
        $this->assertSame('review', $rfc->fresh()->status);
    }

    public function test_admin_can_answer_for_reviewer(): void
    {
        $owner = User::factory()->create();
        $team = $this->team($owner, 1);
        $rev = $this->memberOf($team);
        $rfc = $this->rfcInReview($owner, $team);

        $this->actingAs($owner)->post(route('rfcs.reviewers.store', $rfc), ['email' => $rev->email]);
        $this->actingAs($owner)
            ->patch(route('rfcs.reviewers.update', [$rfc, $rev]), ['status' => 'approved'])
            ->assertRedirect();

        $this->assertSame('approved', $rfc->fresh()->reviewRequests()->first()->status);
    }

    public function test_non_member_cannot_be_requested(): void
    {
        $owner = User::factory()->create();
        $team = $this->team($owner);
        $outsider = User::factory()->create();
        $rfc = $this->rfcInReview($owner, $team);

        $this->actingAs($owner)
            ->post(route('rfcs.reviewers.store', $rfc), ['email' => $outsider->email])
            ->assertSessionHasErrors('email');
    }

    public function test_quorum_setting_updates(): void
    {
        $owner = User::factory()->create();
        $team = $this->team($owner);

        $this->actingAs($owner)
            ->patch(route('teams.settings.update', $team), ['approval_quorum' => 3])
            ->assertRedirect();

        $this->assertSame(3, $team->fresh()->approval_quorum);
    }

    public function test_member_cannot_change_quorum(): void
    {
        $owner = User::factory()->create();
        $team = $this->team($owner);
        $member = $this->memberOf($team);

        $this->actingAs($member)
            ->patch(route('teams.settings.update', $team), ['approval_quorum' => 3])
            ->assertForbidden();
    }
}
