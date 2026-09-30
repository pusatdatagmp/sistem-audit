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
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->string('plate_number')->unique();
            $table->foreignId('vehicle_type_option_id')->constrained('master_data_options')->restrictOnDelete();
            $table->foreignId('status_option_id')->constrained('master_data_options')->restrictOnDelete();
            $table->foreignId('home_kitchen_id')->nullable()->constrained('kitchens')->nullOnDelete();
            $table->string('brand')->nullable();
            $table->string('model')->nullable();
            $table->smallInteger('year')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
