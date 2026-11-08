<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rfc_transitions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rfc_id')->constrained()->onDelete('cascade');
            $table->string('from_status')->nullable();
            $table->string('to_status');
            $table->foreignId('actor_id')->constrained('users')->onDelete('cascade');
            $table->text('comment')->nullable();
            $table->timestamps();

            $table->index('rfc_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rfc_transitions');
    }
};
