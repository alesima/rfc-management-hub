<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('review_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rfc_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('status')->default('pending');
            $table->timestamps();

            $table->unique(['rfc_id', 'user_id']);
        });

        Schema::table('teams', function (Blueprint $table) {
            $table->unsignedInteger('approval_quorum')->default(1)->after('seats_limit');
        });
    }

    public function down(): void
    {
        Schema::table('teams', function (Blueprint $table) {
            $table->dropColumn('approval_quorum');
        });

        Schema::dropIfExists('review_requests');
    }
};
