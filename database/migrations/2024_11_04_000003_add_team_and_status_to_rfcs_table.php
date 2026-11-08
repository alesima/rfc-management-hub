<?php

use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rfcs', function (Blueprint $table) {
            $table->foreignId('team_id')->nullable()->after('user_id')->constrained()->onDelete('cascade');
            $table->string('status')->default('draft')->after('version');
            $table->foreignId('decided_by')->nullable()->after('status')->constrained('users')->nullOnDelete();
            $table->timestamp('decided_at')->nullable()->after('decided_by');
            $table->index('status');
        });

        // Backfill: one personal team per user with RFCs, assign orphan RFCs.
        foreach (User::all() as $user) {
            $team = Team::firstOrCreate(
                ['slug' => 'personal-'.$user->id],
                ['name' => $user->name."'s team", 'owner_id' => $user->id]
            );
            $team->memberships()->firstOrCreate(
                ['user_id' => $user->id],
                ['role' => 'owner']
            );
            $user->rfcs()->whereNull('team_id')->update(['team_id' => $team->id]);
        }

        // RFCs whose author was deleted: attach to first team or leave null.
        if ($firstTeam = Team::first()) {
            \App\Models\Rfc::whereNull('team_id')->update(['team_id' => $firstTeam->id]);
        }
    }

    public function down(): void
    {
        Schema::table('rfcs', function (Blueprint $table) {
            $table->dropConstrainedForeignId('team_id');
            $table->dropConstrainedForeignId('decided_by');
            $table->dropColumn(['status', 'decided_at']);
        });
    }
};
