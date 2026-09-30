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
        Schema::create('inventory_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kitchen_inventory_id')->constrained()->restrictOnDelete();
            $table->string('type');
            $table->foreignId('condition_option_id')->nullable()->constrained('master_data_options')->restrictOnDelete();
            $table->integer('quantity_change');
            $table->integer('stock_before');
            $table->integer('stock_after');
            $table->uuid('transfer_group_id')->nullable();
            $table->foreignId('related_kitchen_id')->nullable()->constrained('kitchens')->nullOnDelete();
            $table->foreignId('performed_by')->constrained('users')->restrictOnDelete();
            $table->text('note')->nullable();
            $table->timestamps();

            $table->index(['kitchen_inventory_id', 'created_at']);
            $table->index('transfer_group_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('inventory_logs');
    }
};
