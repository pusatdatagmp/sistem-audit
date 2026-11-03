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
        Schema::create('vehicle_inspection_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_inspection_id')->constrained()->cascadeOnDelete();
            $table->foreignId('component_option_id')->constrained('master_data_options')->restrictOnDelete();
            $table->foreignId('condition_option_id')->constrained('master_data_options')->restrictOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['vehicle_inspection_id', 'component_option_id'], 'vehicle_inspection_items_inspection_component_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicle_inspection_items');
    }
};
