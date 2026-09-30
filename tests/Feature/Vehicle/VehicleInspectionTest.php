<?php

use App\Models\MasterDataOption;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleInspection;
use App\Models\VehicleInspectionItem;
use Database\Seeders\MasterDataSeeder;

beforeEach(function () {
    $this->seed(MasterDataSeeder::class);
    $this->user = User::factory()->create();
});

test('guests are redirected to the login page', function () {
    $this->get(route('vehicles.inspections.index'))->assertRedirect('/login');
});

test('an inspection can be recorded with multiple component items', function () {
    $this->actingAs($this->user);

    $vehicle = Vehicle::factory()->create();
    $components = MasterDataOption::ofGroup('vehicle_component')->take(3)->get();

    $this->post(route('vehicles.inspections.store'), [
        'vehicle_id' => $vehicle->id,
        'odometer' => 12345,
        'notes' => 'Pemeriksaan rutin',
        'items' => $components->map(fn ($component, $index) => [
            'component_option_id' => $component->id,
            'condition_code' => $index === 0 ? 'rusak-berat' : 'baik',
            'notes' => null,
        ])->all(),
    ])->assertRedirect(route('vehicles.inspections.index'));

    $inspection = VehicleInspection::where('vehicle_id', $vehicle->id)->firstOrFail();

    expect($inspection->items)->toHaveCount(3)
        ->and($inspection->odometer)->toBe(12345)
        ->and($inspection->inspected_by)->toBe($this->user->id);
});

test('an inspection requires a valid condition code for each item', function () {
    $this->actingAs($this->user);

    $vehicle = Vehicle::factory()->create();
    $component = MasterDataOption::ofGroup('vehicle_component')->first();

    $this->post(route('vehicles.inspections.store'), [
        'vehicle_id' => $vehicle->id,
        'items' => [
            ['component_option_id' => $component->id, 'condition_code' => 'entah'],
        ],
    ])->assertSessionHasErrors('items.0.condition_code');
});

test('an inspection can be viewed and deleted', function () {
    $this->actingAs($this->user);

    $inspection = VehicleInspection::factory()
        ->has(VehicleInspectionItem::factory()->count(2), 'items')
        ->create();

    $this->get(route('vehicles.inspections.show', $inspection))->assertOk();

    $this->delete(route('vehicles.inspections.destroy', $inspection))->assertRedirect(route('vehicles.inspections.index'));

    $this->assertDatabaseMissing('vehicle_inspections', ['id' => $inspection->id]);
    $this->assertDatabaseMissing('vehicle_inspection_items', ['vehicle_inspection_id' => $inspection->id]);
});
