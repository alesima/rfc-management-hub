<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rfcs', function (Blueprint $table) {
            $table->date('review_due_at')->nullable()->after('decided_at');
        });
    }

    public function down(): void
    {
        Schema::table('rfcs', function (Blueprint $table) {
            $table->dropColumn('review_due_at');
        });
    }
};
