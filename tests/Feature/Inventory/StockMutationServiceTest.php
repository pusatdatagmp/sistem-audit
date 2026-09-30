<?php

use App\Exceptions\InsufficientStockException;
use App\Models\Kitchen;
use App\Models\KitchenInventory;
use App\Models\KitchenTool;
use App\Models\User;
use App\Services\Inventory\StockMutationService;
use Database\Seeders\MasterDataSeeder;

beforeEach(function () {
    $this->seed(MasterDataSeeder::class);
    $this->service = app(StockMutationService::class);
    $this->actor = User::factory()->create();
});

test('stock in increases the given condition bucket and writes a log', function () {
    $inventory = KitchenInventory::factory()->create(['quantity_good' => 5]);

    $log = $this->service->stockIn($inventory, 3, 'baik', $this->actor, 'restock');

    expect($inventory->fresh()->quantity_good)->toBe(8)
        ->and($log->type)->toBe('in')
        ->and($log->quantity_change)->toBe(3)
        ->and($log->stock_before)->toBe(5)
        ->and($log->stock_after)->toBe(8)
        ->and($log->performed_by)->toBe($this->actor->id);
});

test('stock out decreases the given condition bucket and writes a log', function () {
    $inventory = KitchenInventory::factory()->create(['quantity_good' => 10]);

    $log = $this->service->stockOut($inventory, 4, 'baik', $this->actor);

    expect($inventory->fresh()->quantity_good)->toBe(6)
        ->and($log->type)->toBe('out')
        ->and($log->quantity_change)->toBe(-4);
});

test('stock out throws when the condition bucket does not have enough stock', function () {
    $inventory = KitchenInventory::factory()->create(['quantity_good' => 2]);

    expect(fn () => $this->service->stockOut($inventory, 5, 'baik', $this->actor))
        ->toThrow(InsufficientStockException::class);

    expect($inventory->fresh()->quantity_good)->toBe(2);
});

test('transfer moves stock between kitchens and creates a linked pair of logs', function () {
    $tool = KitchenTool::factory()->create();
    $from = Kitchen::factory()->create();
    $to = Kitchen::factory()->create();

    $source = KitchenInventory::factory()->create([
        'kitchen_id' => $from->id,
        'kitchen_tool_id' => $tool->id,
        'quantity_good' => 10,
    ]);

    [$outLog, $inLog] = $this->service->transfer($from, $to, $tool, 4, 'baik', $this->actor);

    $destination = KitchenInventory::where('kitchen_id', $to->id)->where('kitchen_tool_id', $tool->id)->first();

    expect($source->fresh()->quantity_good)->toBe(6)
        ->and($destination)->not->toBeNull()
        ->and($destination->quantity_good)->toBe(4)
        ->and($outLog->type)->toBe('transfer_out')
        ->and($inLog->type)->toBe('transfer_in')
        ->and($outLog->transfer_group_id)->toBe($inLog->transfer_group_id)
        ->and($outLog->transfer_group_id)->not->toBeNull();
});

test('transfer throws and leaves both sides unchanged when source stock is insufficient', function () {
    $tool = KitchenTool::factory()->create();
    $from = Kitchen::factory()->create();
    $to = Kitchen::factory()->create();

    $source = KitchenInventory::factory()->create([
        'kitchen_id' => $from->id,
        'kitchen_tool_id' => $tool->id,
        'quantity_good' => 1,
    ]);

    expect(fn () => $this->service->transfer($from, $to, $tool, 5, 'baik', $this->actor))
        ->toThrow(InsufficientStockException::class);

    expect($source->fresh()->quantity_good)->toBe(1)
        ->and(KitchenInventory::where('kitchen_id', $to->id)->where('kitchen_tool_id', $tool->id)->exists())->toBeFalse();
});

test('opname adjusts only the condition buckets that changed', function () {
    $inventory = KitchenInventory::factory()->create([
        'quantity_good' => 10,
        'quantity_needs_repair' => 2,
        'quantity_damaged' => 0,
    ]);

    $logs = $this->service->opname($inventory, [
        'baik' => 8,
        'perlu-perbaikan' => 2,
        'rusak-berat' => 1,
    ], $this->actor, 'opname bulanan');

    $inventory->refresh();

    expect($inventory->quantity_good)->toBe(8)
        ->and($inventory->quantity_needs_repair)->toBe(2)
        ->and($inventory->quantity_damaged)->toBe(1)
        ->and($logs)->toHaveCount(2);

    $types = collect($logs)->pluck('quantity_change')->all();
    expect($types)->toContain(-2)->toContain(1);
});
