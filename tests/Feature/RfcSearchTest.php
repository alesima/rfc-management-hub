<?php

namespace Tests\Feature;

use App\Models\Rfc;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class RfcSearchTest extends TestCase
{
    use RefreshDatabase;

    private function makeRfc(string $title, string $status = Rfc::STATUS_DRAFT, array $over = []): Rfc
    {
        $user = User::factory()->create();

        return Rfc::create(array_merge([
            'title' => $title, 'summary' => 'Generic summary', 'slug' => \Str::slug($title).random_int(1, 99999),
            'content' => json_encode([]),
            'user_id' => $user->id, 'team_id' => null, 'status' => $status,
        ], $over));
    }

    public function test_search_filters_by_title(): void
    {
        $this->makeRfc('Postgres migration plan');
        $this->makeRfc('Redis cache layer');

        $this->get('/rfcs?q=postgres')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('rfcs', 1)
                ->where('rfcs.0.title', 'Postgres migration plan'));
    }

    public function test_search_matches_summary(): void
    {
        $this->makeRfc('Totally unrelated', Rfc::STATUS_DRAFT, ['summary' => 'mentions kubernetes here']);

        $this->get('/rfcs?q=kubernetes')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->has('rfcs', 1));
    }

    public function test_status_filter(): void
    {
        $this->makeRfc('Draft one');
        $this->makeRfc('Review one', Rfc::STATUS_REVIEW);

        $this->get('/rfcs?status=review')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('rfcs', 1)
                ->where('rfcs.0.status', 'review'));
    }

    public function test_stale_filter_flags_old_reviews(): void
    {
        $old = $this->makeRfc('Old review', Rfc::STATUS_REVIEW);
        $this->makeRfc('Fresh review', Rfc::STATUS_REVIEW);
        Rfc::where('id', $old->id)->update(['updated_at' => now()->subDays(20)]);

        $this->get('/rfcs?stale=1')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('rfcs', 1)
                ->where('rfcs.0.title', 'Old review')
                ->where('rfcs.0.is_stale', true));
    }

    public function test_invalid_status_is_ignored(): void
    {
        $this->makeRfc('Anything');

        $this->get('/rfcs?status=bogus')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->has('rfcs', 1));
    }

    public function test_search_matches_body_content(): void
    {
        $this->makeRfc('Unrelated title', Rfc::STATUS_DRAFT, [
            'summary' => 'Generic words here',
            'content' => json_encode(['motivation' => 'We need zebracorns for scale']),
        ]);
        $this->makeRfc('Other doc');

        $this->get('/rfcs?q=zebracorns')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->has('rfcs', 1));
    }

    public function test_search_with_special_chars_does_not_crash(): void
    {
        $this->makeRfc('Plain doc');

        $this->get('/rfcs?q=" OR 1=1 --')
            ->assertOk();

        $this->get('/rfcs?q=***(((')
            ->assertOk();
    }
}
