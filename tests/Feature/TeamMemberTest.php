<?php

namespace Tests\Feature;

use App\Models\Membership;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TeamMemberTest extends TestCase
{
    use RefreshDatabase;

    private function teamWithOwner(User $owner, int $seats = 5): Team
    {
        $team = Team::create([
            'name' => 'Core', 'slug' => 'core-'.$owner->id,
            'owner_id' => $owner->id, 'seats_limit' => $seats,
        ]);
        $team->memberships()->create(['user_id' => $owner->id, 'role' => Membership::ROLE_OWNER]);

        return $team;
    }

    public function test_admin_can_invite_existing_user(): void
    {
        $owner = User::factory()->create();
        $newcomer = User::factory()->create();
        $team = $this->teamWithOwner($owner);

        $this->actingAs($owner)
            ->post(route('teams.members.store', $team), ['email' => $newcomer->email, 'role' => 'member'])
            ->assertRedirect();

        $this->assertDatabaseHas('memberships', [
            'team_id' => $team->id, 'user_id' => $newcomer->id, 'role' => 'member',
        ]);
    }

    public function test_invite_fails_when_seats_full(): void
    {
        $owner = User::factory()->create();
        $newcomer = User::factory()->create();
        $team = $this->teamWithOwner($owner, 1);

        $this->actingAs($owner)
            ->post(route('teams.members.store', $team), ['email' => $newcomer->email, 'role' => 'member'])
            ->assertSessionHasErrors('email');

        $this->assertDatabaseMissing('memberships', ['team_id' => $team->id, 'user_id' => $newcomer->id]);
    }

    public function test_non_admin_cannot_invite(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $newcomer = User::factory()->create();
        $team = $this->teamWithOwner($owner);
        $team->memberships()->create(['user_id' => $member->id, 'role' => Membership::ROLE_MEMBER]);

        $this->actingAs($member)
            ->post(route('teams.members.store', $team), ['email' => $newcomer->email, 'role' => 'member'])
            ->assertForbidden();
    }

    public function test_invite_unknown_email_fails_validation(): void
    {
        $owner = User::factory()->create();
        $team = $this->teamWithOwner($owner);

        $this->actingAs($owner)
            ->post(route('teams.members.store', $team), ['email' => 'ghost@example.com', 'role' => 'member'])
            ->assertSessionHasErrors('email');
    }

    public function test_admin_can_remove_member(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $team = $this->teamWithOwner($owner);
        $team->memberships()->create(['user_id' => $member->id, 'role' => Membership::ROLE_MEMBER]);

        $this->actingAs($owner)
            ->delete(route('teams.members.destroy', [$team, $member]))
            ->assertRedirect();

        $this->assertDatabaseMissing('memberships', ['team_id' => $team->id, 'user_id' => $member->id]);
    }

    public function test_cannot_remove_last_owner(): void
    {
        $owner = User::factory()->create();
        $team = $this->teamWithOwner($owner);

        $this->actingAs($owner)
            ->delete(route('teams.members.destroy', [$team, $owner]))
            ->assertSessionHasErrors('email');

        $this->assertDatabaseHas('memberships', ['team_id' => $team->id, 'user_id' => $owner->id]);
    }
}
