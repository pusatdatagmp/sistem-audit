<?php

use App\Models\EquipmentRequest;
use App\Models\Kitchen;
use App\Models\KitchenInventory;
use App\Models\KitchenTool;
use App\Models\MasterDataOption;
use App\Models\User;
use Database\Seeders\MasterDataSeeder;

beforeEach(function () {
    $this->seed(MasterDataSeeder::class);
    $this->admin = User::factory()->create();
    $this->category = MasterDataOption::ofGroup('kitchen_tool_category')->first();
});

test('guests are redirected to the login page', function () {
    $this->get(route('equipment-requests.index'))->assertRedirect('/login');
    $this->get(route('driver.equipment-requests.index'))->assertRedirect('/login');
});

test('a reporter is blocked from the equipment request areas', function () {
    $reporter = User::factory()->reporter()->create();

    $this->actingAs($reporter);

    $this->get(route('equipment-requests.index'))->assertForbidden();
    $this->get(route('driver.equipment-requests.index'))->assertForbidden();
});

test('a driver can create an equipment request for their own kitchen', function () {
    $kitchen = Kitchen::factory()->create();
    $otherKitchen = Kitchen::factory()->create();
    $driver = User::factory()->driver()->create(['kitchen_id' => $kitchen->id]);
    $tool = KitchenTool::factory()->create();

    $this->actingAs($driver);

    $this->post(route('driver.equipment-requests.store'), [
        'kitchen_id' => $otherKitchen->id, // attempt to spoof
        'kitchen_tool_id' => $tool->id,
        'quantity' => 3,
        'reason' => 'Alat lama sudah rusak.',
    ])->assertSessionHasNoErrors();

    $request = EquipmentRequest::first();

    expect($request->kitchen_id)->toBe($kitchen->id)
        ->and($request->requested_by)->toBe($driver->id)
        ->and($request->status)->toBe(EquipmentRequest::STATUS_PENDING);
});

test('an admin can create an equipment request for any kitchen', function () {
    $this->actingAs($this->admin);

    $kitchen = Kitchen::factory()->create();
    $tool = KitchenTool::factory()->create();

    $this->post(route('equipment-requests.store'), [
        'kitchen_id' => $kitchen->id,
        'kitchen_tool_id' => $tool->id,
        'quantity' => 2,
        'reason' => 'Stok menipis.',
    ])->assertSessionHasNoErrors();

    expect(EquipmentRequest::where('kitchen_id', $kitchen->id)->exists())->toBeTrue();
});

test('an equipment request must choose exactly one of catalog tool or a new tool name', function () {
    $this->actingAs($this->admin);

    $kitchen = Kitchen::factory()->create();

    $this->post(route('equipment-requests.store'), [
        'kitchen_id' => $kitchen->id,
        'quantity' => 1,
        'reason' => 'Butuh alat.',
    ])->assertSessionHasErrors(['kitchen_tool_id', 'new_tool_name']);

    $tool = KitchenTool::factory()->create();

    $this->post(route('equipment-requests.store'), [
        'kitchen_id' => $kitchen->id,
        'kitchen_tool_id' => $tool->id,
        'new_tool_name' => 'Panci Baru',
        'new_tool_unit' => 'pcs',
        'new_tool_category_option_id' => $this->category->id,
        'quantity' => 1,
        'reason' => 'Butuh alat.',
    ])->assertSessionHasErrors();
});

test('approving a catalog-based request adds stock and logs the mutation', function () {
    $this->actingAs($this->admin);

    $kitchen = Kitchen::factory()->create();
    $tool = KitchenTool::factory()->create();
    KitchenInventory::factory()->create(['kitchen_id' => $kitchen->id, 'kitchen_tool_id' => $tool->id, 'quantity_good' => 5]);

    $request = EquipmentRequest::factory()->create([
        'kitchen_id' => $kitchen->id,
        'kitchen_tool_id' => $tool->id,
        'quantity' => 4,
    ]);

    $this->post(route('equipment-requests.update-status', $request), ['status' => 'approved'])->assertSessionHasNoErrors();

    $inventory = KitchenInventory::where('kitchen_id', $kitchen->id)->where('kitchen_tool_id', $tool->id)->first();

    expect($inventory->quantity_good)->toBe(9)
        ->and($request->fresh()->status)->toBe(EquipmentRequest::STATUS_APPROVED)
        ->and($request->fresh()->reviewed_by)->toBe($this->admin->id);

    $this->assertDatabaseHas('inventory_logs', [
        'kitchen_inventory_id' => $inventory->id,
        'type' => 'in',
        'quantity_change' => 4,
    ]);
});

test('approving a new-tool request creates the tool and adds stock', function () {
    $this->actingAs($this->admin);

    $kitchen = Kitchen::factory()->create();

    $request = EquipmentRequest::factory()->forNewTool()->create([
        'kitchen_id' => $kitchen->id,
        'new_tool_name' => 'Panci Serbaguna',
        'new_tool_category_option_id' => $this->category->id,
        'quantity' => 6,
    ]);

    $this->post(route('equipment-requests.update-status', $request), ['status' => 'approved'])->assertSessionHasNoErrors();

    $tool = KitchenTool::where('name', 'Panci Serbaguna')->first();

    expect($tool)->not->toBeNull()
        ->and($tool->code)->toBe('panci-serbaguna')
        ->and($request->fresh()->kitchen_tool_id)->toBe($tool->id);

    $inventory = KitchenInventory::where('kitchen_id', $kitchen->id)->where('kitchen_tool_id', $tool->id)->first();

    expect($inventory)->not->toBeNull()
        ->and($inventory->quantity_good)->toBe(6);
});

test('rejecting a request requires a note and does not change stock', function () {
    $this->actingAs($this->admin);

    $kitchen = Kitchen::factory()->create();
    $tool = KitchenTool::factory()->create();
    $inventory = KitchenInventory::factory()->create(['kitchen_id' => $kitchen->id, 'kitchen_tool_id' => $tool->id, 'quantity_good' => 2]);

    $request = EquipmentRequest::factory()->create([
        'kitchen_id' => $kitchen->id,
        'kitchen_tool_id' => $tool->id,
        'quantity' => 3,
    ]);

    $this->post(route('equipment-requests.update-status', $request), ['status' => 'rejected'])->assertSessionHasErrors('note');

    $this->post(route('equipment-requests.update-status', $request), [
        'status' => 'rejected',
        'note' => 'Stok masih cukup.',
    ])->assertSessionHasNoErrors();

    expect($request->fresh()->status)->toBe(EquipmentRequest::STATUS_REJECTED)
        ->and($inventory->fresh()->quantity_good)->toBe(2);
});

test('an already processed request cannot be processed again', function () {
    $this->actingAs($this->admin);

    $kitchen = Kitchen::factory()->create();
    $tool = KitchenTool::factory()->create();
    KitchenInventory::factory()->create(['kitchen_id' => $kitchen->id, 'kitchen_tool_id' => $tool->id, 'quantity_good' => 0]);

    $request = EquipmentRequest::factory()->create([
        'kitchen_id' => $kitchen->id,
        'kitchen_tool_id' => $tool->id,
        'quantity' => 5,
        'status' => EquipmentRequest::STATUS_APPROVED,
    ]);

    $this->post(route('equipment-requests.update-status', $request), ['status' => 'approved'])->assertSessionHasErrors('status');

    expect(KitchenInventory::where('kitchen_id', $kitchen->id)->where('kitchen_tool_id', $tool->id)->first()->quantity_good)->toBe(0);
});

test('a driver only sees their own equipment requests', function () {
    $kitchen = Kitchen::factory()->create();
    $driver = User::factory()->driver()->create(['kitchen_id' => $kitchen->id]);
    $otherDriver = User::factory()->driver()->create(['kitchen_id' => $kitchen->id]);

    EquipmentRequest::factory()->create(['requested_by' => $driver->id, 'kitchen_id' => $kitchen->id]);
    EquipmentRequest::factory()->create(['requested_by' => $otherDriver->id, 'kitchen_id' => $kitchen->id]);

    $this->actingAs($driver);

    $response = $this->get(route('driver.equipment-requests.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->has('equipmentRequests.data', 1));
});
