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
        Schema::create('equipment_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('requested_by')->constrained('users')->restrictOnDelete();
            $table->foreignId('kitchen_id')->constrained('kitchens')->restrictOnDelete();
            $table->foreignId('kitchen_tool_id')->nullable()->constrained('kitchen_tools')->restrictOnDelete();
            $table->string('new_tool_name')->nullable();
            $table->string('new_tool_unit', 20)->nullable();
            $table->foreignId('new_tool_category_option_id')->nullable()->constrained('master_data_options')->restrictOnDelete();
            $table->unsignedInteger('quantity');
            $table->text('reason');
            $table->string('status')->default('pending');
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->restrictOnDelete();
            $table->text('review_note')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('equipment_requests');
    }
};
