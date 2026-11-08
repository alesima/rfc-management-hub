<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('CREATE VIRTUAL TABLE IF NOT EXISTS rfc_search USING fts5(rfc_id UNINDEXED, title, summary, body)');

        foreach (\App\Models\Rfc::all() as $rfc) {
            $rfc->syncSearchIndex();
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('rfc_search');
    }
};
