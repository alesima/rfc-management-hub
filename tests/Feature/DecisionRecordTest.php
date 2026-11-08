<?php

namespace Tests\Feature;

use App\Models\Membership;
use App\Models\Rfc;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DecisionRecordTest extends TestCase
{
    use RefreshDatabase;

    private function teamWithOwner(User $owner): Team
    {
        $team = Team::create(['name' => 'Core', 'slug' => 'core-'.$owner->id, 'owner_id' => $owner->id]);
        $team->memberships()->create(['user_id' => $owner->id, 'role' => Membership::ROLE_OWNER]);

        return $team;
    }

    public function test_approve_freezes_a_decision_record(): void
    {
        $owner = User::factory()->create();
        $team = $this->teamWithOwner($owner);
        $rfc = Rfc::create([
            'title' => 'Use Postgres', 'summary' => 'S', 'slug' => 'use-postgres',
            'content' => json_encode(['motivation' => 'scale']),
            'user_id' => $owner->id, 'team_id' => $team->id, 'status' => Rfc::STATUS_REVIEW,
        ]);

        $this->actingAs($owner)
            ->patch(route('rfcs.status.update', $rfc), ['to_status' => 'approved'])
            ->assertRedirect();

        $this->assertDatabaseHas('decision_records', [
            'rfc_id' => $rfc->id, 'title' => 'Use Postgres',
            'status' => 'approved', 'rfc_version' => 1, 'decided_by' => $owner->id,
        ]);
    }

    public function test_reapprove_after_edit_keeps_history(): void
    {
        $owner = User::factory()->create();
        $team = $this->teamWithOwner($owner);
        $rfc = Rfc::create([
            'title' => 'Use Postgres', 'summary' => 'S', 'slug' => 'use-postgres',
            'content' => json_encode(['motivation' => 'scale']),
            'user_id' => $owner->id, 'team_id' => $team->id, 'status' => Rfc::STATUS_REVIEW,
        ]);

        $this->actingAs($owner)->patch(route('rfcs.status.update', $rfc), ['to_status' => 'approved']);
        $this->actingAs($owner)->put(route('rfcs.update', $rfc), ['title' => 'Use Postgres v2', 'summary' => 'S']);
        $this->actingAs($owner)->patch(route('rfcs.status.update', $rfc->fresh()), ['to_status' => 'review']);
        $this->actingAs($owner)->patch(route('rfcs.status.update', $rfc->fresh()), ['to_status' => 'approved']);

        $this->assertSame(2, $rfc->decisionRecords()->count());
        $this->assertSame('Use Postgres v2', $rfc->decisionRecords()->orderByDesc('decided_at')->orderByDesc('id')->first()->title);
    }

    public function test_decision_download_returns_markdown(): void
    {
        $owner = User::factory()->create();
        $team = $this->teamWithOwner($owner);
        $rfc = Rfc::create([
            'title' => 'Use Postgres', 'summary' => 'Why not', 'slug' => 'use-postgres',
            'content' => json_encode(['motivation' => 'scale']),
            'user_id' => $owner->id, 'team_id' => $team->id, 'status' => Rfc::STATUS_REVIEW,
        ]);

        $this->actingAs($owner)->patch(route('rfcs.status.update', $rfc), ['to_status' => 'approved']);

        $response = $this->actingAs($owner)->get(route('rfcs.decision.download', $rfc));
        $response->assertOk();
        $response->assertHeader('content-disposition');
        $this->assertStringContainsString('# ADR: Use Postgres', $response->getContent());
        $this->assertStringContainsString('- Status: approved', $response->getContent());
    }

    public function test_decision_download_404_without_decision(): void
    {
        $owner = User::factory()->create();
        $team = $this->teamWithOwner($owner);
        $rfc = Rfc::create([
            'title' => 'Draft', 'summary' => 'S', 'slug' => 'draft',
            'content' => json_encode([]),
            'user_id' => $owner->id, 'team_id' => $team->id, 'status' => Rfc::STATUS_DRAFT,
        ]);

        $this->actingAs($owner)->get(route('rfcs.decision.download', $rfc))->assertNotFound();
    }
}
