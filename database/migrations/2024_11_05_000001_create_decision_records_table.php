<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('decision_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rfc_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('summary')->nullable();
            $table->text('content');
            $table->string('status');
            $table->unsignedInteger('rfc_version');
            $table->foreignId('decided_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('decided_at')->nullable();
            $table->timestamps();

            $table->index('rfc_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('decision_records');
    }
};
