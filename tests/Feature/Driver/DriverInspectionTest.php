<?php

use App\Models\MasterDataOption;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleInspection;
use App\Models\VehicleInspectionItem;
use Database\Seeders\MasterDataSeeder;

beforeEach(function () {
    $this->seed(MasterDataSeeder::class);
    $this->driver = User::factory()->driver()->create();
    $this->vehicle = Vehicle::factory()->create(['is_active' => true]);
});

test('guests are redirected to the login page', function () {
    $this->get(route('driver.inspections.index'))->assertRedirect('/login');
});

test('a reporter is blocked from the driver inspection area', function () {
    $this->actingAs(User::factory()->reporter()->create());

    $this->get(route('driver.inspections.index'))->assertForbidden();
    $this->get(route('driver.inspections.create'))->assertForbidden();
});

test('a driver can record a daily vehicle inspection', function () {
    $this->actingAs($this->driver);

    $this->get(route('driver.inspections.index'))->assertOk();
    $this->get(route('driver.inspections.create'))->assertOk();

    $components = MasterDataOption::ofGroup('vehicle_component')->take(3)->get();

    $this->post(route('driver.inspections.store'), [
        'vehicle_id' => $this->vehicle->id,
        'odometer' => 54321,
        'notes' => 'Cek harian pagi',
        'items' => $components->map(fn ($component, $index) => [
            'component_option_id' => $component->id,
            'condition_code' => $index === 0 ? 'perlu-perbaikan' : 'baik',
            'notes' => null,
        ])->all(),
    ])->assertRedirect(route('driver.inspections.index'));

    $inspection = VehicleInspection::where('vehicle_id', $this->vehicle->id)->firstOrFail();

    expect($inspection->items)->toHaveCount(3)
        ->and($inspection->odometer)->toBe(54321)
        ->and($inspection->inspected_by)->toBe($this->driver->id);
});

test('a driver only sees their own inspections in the list', function () {
    $otherDriver = User::factory()->driver()->create();

    VehicleInspection::factory()
        ->has(VehicleInspectionItem::factory()->count(1), 'items')
        ->create(['inspected_by' => $otherDriver->id, 'vehicle_id' => $this->vehicle->id]);

    $ownInspection = VehicleInspection::factory()
        ->has(VehicleInspectionItem::factory()->count(1), 'items')
        ->create(['inspected_by' => $this->driver->id, 'vehicle_id' => $this->vehicle->id]);

    $this->actingAs($this->driver);

    $response = $this->get(route('driver.inspections.index'));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->has('inspections.data', 1)
        ->where('inspections.data.0.id', $ownInspection->id));
});

test('a driver cannot view another driver inspection', function () {
    $otherDriver = User::factory()->driver()->create();

    $inspection = VehicleInspection::factory()
        ->has(VehicleInspectionItem::factory()->count(1), 'items')
        ->create(['inspected_by' => $otherDriver->id, 'vehicle_id' => $this->vehicle->id]);

    $this->actingAs($this->driver);

    $this->get(route('driver.inspections.show', $inspection))->assertForbidden();
});

test('a driver can view their own inspection detail', function () {
    $inspection = VehicleInspection::factory()
        ->has(VehicleInspectionItem::factory()->count(2), 'items')
        ->create(['inspected_by' => $this->driver->id, 'vehicle_id' => $this->vehicle->id]);

    $this->actingAs($this->driver);

    $this->get(route('driver.inspections.show', $inspection))->assertOk();
});
