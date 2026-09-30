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
        Schema::create('kitchen_inventories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kitchen_id')->constrained()->restrictOnDelete();
            $table->foreignId('kitchen_tool_id')->constrained()->restrictOnDelete();
            $table->unsignedInteger('quantity_good')->default(0);
            $table->unsignedInteger('quantity_needs_repair')->default(0);
            $table->unsignedInteger('quantity_damaged')->default(0);
            $table->timestamps();

            $table->unique(['kitchen_id', 'kitchen_tool_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kitchen_inventories');
    }
};
