<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('teams', function (Blueprint $table) {
            $table->string('slack_webhook_url', 500)->nullable()->after('approval_quorum');
            $table->string('teams_webhook_url', 500)->nullable()->after('slack_webhook_url');
        });
    }

    public function down(): void
    {
        Schema::table('teams', function (Blueprint $table) {
            $table->dropColumn(['slack_webhook_url', 'teams_webhook_url']);
        });
    }
};
