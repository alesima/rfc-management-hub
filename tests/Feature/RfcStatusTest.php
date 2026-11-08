<?php

namespace Tests\Feature;

use App\Models\Membership;
use App\Models\Rfc;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RfcStatusTest extends TestCase
{
    use RefreshDatabase;

    private function teamWithOwner(User $owner): Team
    {
        $team = Team::create(['name' => 'Core', 'slug' => 'core', 'owner_id' => $owner->id]);
        $team->memberships()->create(['user_id' => $owner->id, 'role' => Membership::ROLE_OWNER]);

        return $team;
    }

    private function makeRfc(User $author, Team $team, string $status = Rfc::STATUS_DRAFT): Rfc
    {
        return Rfc::create([
            'title' => 'Test RFC',
            'summary' => 'Summary',
            'slug' => 'test-rfc-'.$status,
            'content' => json_encode(['motivation' => 'x']),
            'user_id' => $author->id,
            'team_id' => $team->id,
            'status' => $status,
        ]);
    }

    public function test_author_can_request_review(): void
    {
        $author = User::factory()->create();
        $rfc = $this->makeRfc($author, $this->teamWithOwner($author));

        $this->actingAs($author)
            ->patch(route('rfcs.status.update', $rfc), ['to_status' => 'review'])
            ->assertRedirect();

        $this->assertSame('review', $rfc->fresh()->status);
        $this->assertDatabaseHas('rfc_transitions', [
            'rfc_id' => $rfc->id, 'from_status' => 'draft', 'to_status' => 'review',
        ]);
    }

    public function test_author_cannot_approve_own_rfc(): void
    {
        $owner = User::factory()->create();
        $author = User::factory()->create();
        $team = $this->teamWithOwner($owner);
        $team->memberships()->create(['user_id' => $author->id, 'role' => Membership::ROLE_MEMBER]);
        $rfc = $this->makeRfc($author, $team, Rfc::STATUS_REVIEW);

        $this->actingAs($author)
            ->patch(route('rfcs.status.update', $rfc), ['to_status' => 'approved'])
            ->assertForbidden();

        $this->assertSame('review', $rfc->fresh()->status);
    }

    public function test_admin_can_approve_after_review(): void
    {
        $author = User::factory()->create();
        $admin = User::factory()->create();
        $team = $this->teamWithOwner($author);
        $team->memberships()->create(['user_id' => $admin->id, 'role' => Membership::ROLE_ADMIN]);
        $rfc = $this->makeRfc($author, $team, Rfc::STATUS_REVIEW);

        $this->actingAs($admin)
            ->patch(route('rfcs.status.update', $rfc), ['to_status' => 'approved'])
            ->assertRedirect();

        $fresh = $rfc->fresh();
        $this->assertSame('approved', $fresh->status);
        $this->assertSame($admin->id, $fresh->decided_by);
    }

    public function test_invalid_transition_is_rejected(): void
    {
        $author = User::factory()->create();
        $rfc = $this->makeRfc($author, $this->teamWithOwner($author));

        $this->actingAs($author)
            ->patch(route('rfcs.status.update', $rfc), ['to_status' => 'archived'])
            ->assertSessionHasErrors('to_status');

        $this->assertSame('draft', $rfc->fresh()->status);
    }

    public function test_non_author_member_cannot_edit_rfc(): void
    {
        $author = User::factory()->create();
        $member = User::factory()->create();
        $team = $this->teamWithOwner($author);
        $team->memberships()->create(['user_id' => $member->id, 'role' => Membership::ROLE_MEMBER]);
        $rfc = $this->makeRfc($author, $team);

        $this->actingAs($member)
            ->put(route('rfcs.update', $rfc), [
                'title' => 'Hijacked', 'summary' => 'x',
            ])
            ->assertForbidden();
    }

    public function test_guest_cannot_change_status(): void
    {
        $author = User::factory()->create();
        $rfc = $this->makeRfc($author, $this->teamWithOwner($author));

        $this->patch(route('rfcs.status.update', $rfc), ['to_status' => 'review'])
            ->assertRedirect('/login');
    }
}
