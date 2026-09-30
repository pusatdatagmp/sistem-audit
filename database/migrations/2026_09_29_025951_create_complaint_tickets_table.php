<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('complaint_tickets', function (Blueprint $table) {
            $table->id();
            $table->string('ticket_number')->unique();
            $table->foreignId('reporter_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('kitchen_id')->nullable()->constrained('kitchens')->nullOnDelete();
            $table->foreignId('category_option_id')->constrained('master_data_options')->restrictOnDelete();
            $table->foreignId('priority_option_id')->constrained('master_data_options')->restrictOnDelete();
            $table->string('status')->default('open');
            $table->foreignId('related_kitchen_tool_id')->nullable()->constrained('kitchen_tools')->nullOnDelete();
            $table->foreignId('related_vehicle_id')->nullable()->constrained('vehicles')->nullOnDelete();
            $table->string('subject');
            $table->text('description');
            $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('resolved_at')->nullable();
            $table->timestamps();

            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('complaint_tickets');
    }
};
