<?php

use App\Models\Kitchen;
use App\Models\KitchenInventory;
use App\Models\KitchenTool;
use App\Models\User;
use Database\Seeders\MasterDataSeeder;

beforeEach(function () {
    $this->seed(MasterDataSeeder::class);
    $this->user = User::factory()->create();
});

test('guests are redirected to the login page', function () {
    $this->get('/inventory')->assertRedirect('/login');
});

test('authenticated users can view the inventory index', function () {
    $this->actingAs($this->user);

    KitchenInventory::factory()->create();

    $this->get('/inventory')->assertOk();
});

test('stock in endpoint increases stock and redirects back', function () {
    $this->actingAs($this->user);

    $inventory = KitchenInventory::factory()->create(['quantity_good' => 5]);

    $this->post(route('inventory.stock-in'), [
        'kitchen_inventory_id' => $inventory->id,
        'quantity' => 3,
        'condition_code' => 'baik',
    ])->assertRedirect();

    expect($inventory->fresh()->quantity_good)->toBe(8);
});

test('stock out endpoint flashes an error when stock is insufficient', function () {
    $this->actingAs($this->user);

    $inventory = KitchenInventory::factory()->create(['quantity_good' => 2]);

    $this->post(route('inventory.stock-out'), [
        'kitchen_inventory_id' => $inventory->id,
        'quantity' => 5,
        'condition_code' => 'baik',
    ])->assertSessionHasErrors('quantity');

    expect($inventory->fresh()->quantity_good)->toBe(2);
});

test('transfer endpoint moves stock between two kitchens', function () {
    $this->actingAs($this->user);

    $tool = KitchenTool::factory()->create();
    $from = Kitchen::factory()->create();
    $to = Kitchen::factory()->create();

    KitchenInventory::factory()->create([
        'kitchen_id' => $from->id,
        'kitchen_tool_id' => $tool->id,
        'quantity_good' => 10,
    ]);

    $this->post(route('inventory.transfer'), [
        'from_kitchen_id' => $from->id,
        'to_kitchen_id' => $to->id,
        'kitchen_tool_id' => $tool->id,
        'quantity' => 4,
        'condition_code' => 'baik',
    ])->assertRedirect();

    $destination = KitchenInventory::where('kitchen_id', $to->id)->where('kitchen_tool_id', $tool->id)->first();

    expect($destination)->not->toBeNull()
        ->and($destination->quantity_good)->toBe(4);
});

test('index can be filtered by search term across tool and kitchen names', function () {
    $this->actingAs($this->user);

    $matching = KitchenTool::factory()->create(['name' => 'Panci Presto']);
    $other = KitchenTool::factory()->create(['name' => 'Sendok Sup']);

    KitchenInventory::factory()->create(['kitchen_tool_id' => $matching->id]);
    KitchenInventory::factory()->create(['kitchen_tool_id' => $other->id]);

    $response = $this->get(route('inventory.index', ['search' => 'Presto']));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->has('inventories.data', 1)
        ->where('inventories.data.0.kitchen_tool.name', 'Panci Presto'));
});

test('index can be sorted by total stock descending', function () {
    $this->actingAs($this->user);

    $low = KitchenInventory::factory()->create(['quantity_good' => 2]);
    $high = KitchenInventory::factory()->create(['quantity_good' => 20]);

    $response = $this->get(route('inventory.index', ['sort' => 'total', 'direction' => 'desc']));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->where('inventories.data.0.id', $high->id)
        ->where('inventories.data.1.id', $low->id));
});

test('stock in requires a valid condition code', function () {
    $this->actingAs($this->user);

    $inventory = KitchenInventory::factory()->create();

    $this->post(route('inventory.stock-in'), [
        'kitchen_inventory_id' => $inventory->id,
        'quantity' => 3,
        'condition_code' => 'not-a-real-condition',
    ])->assertSessionHasErrors('condition_code');
});
