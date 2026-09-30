<?php

use App\Models\MasterDataOption;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleMaintenanceSchedule;
use Database\Seeders\MasterDataSeeder;

beforeEach(function () {
    $this->seed(MasterDataSeeder::class);
    $this->user = User::factory()->create();
});

test('guests are redirected to the login page', function () {
    $this->get(route('vehicles.index'))->assertRedirect('/login');
});

test('authenticated users can view and create a vehicle', function () {
    $this->actingAs($this->user);

    $type = MasterDataOption::ofGroup('vehicle_type')->first();
    $status = MasterDataOption::ofGroup('vehicle_status')->first();

    $this->get(route('vehicles.index'))->assertOk();

    $this->post(route('vehicles.store'), [
        'plate_number' => 'B 1111 XYZ',
        'vehicle_type_option_id' => $type->id,
        'status_option_id' => $status->id,
    ])->assertRedirect(route('vehicles.index'));

    $this->assertDatabaseHas('vehicles', ['plate_number' => 'B 1111 XYZ']);
});

test('vehicles can be updated', function () {
    $this->actingAs($this->user);

    $vehicle = Vehicle::factory()->create(['plate_number' => 'B 2222 AAA']);
    $type = MasterDataOption::ofGroup('vehicle_type')->first();
    $status = MasterDataOption::ofGroup('vehicle_status')->first();

    $this->put(route('vehicles.update', $vehicle), [
        'plate_number' => 'B 3333 BBB',
        'vehicle_type_option_id' => $type->id,
        'status_option_id' => $status->id,
        'is_active' => false,
    ])->assertRedirect(route('vehicles.index'));

    expect($vehicle->fresh()->plate_number)->toBe('B 3333 BBB')
        ->and($vehicle->fresh()->is_active)->toBeFalse();
});

test('a vehicle with maintenance history cannot be deleted', function () {
    $this->actingAs($this->user);

    $vehicle = Vehicle::factory()->create();
    VehicleMaintenanceSchedule::factory()->create(['vehicle_id' => $vehicle->id]);

    $this->delete(route('vehicles.destroy', $vehicle))->assertSessionHasErrors('vehicle');

    $this->assertDatabaseHas('vehicles', ['id' => $vehicle->id]);
});

test('a maintenance schedule can be marked as complete', function () {
    $this->actingAs($this->user);

    $schedule = VehicleMaintenanceSchedule::factory()->create(['completed_at' => null]);

    $this->post(route('vehicles.maintenance.complete', $schedule))->assertRedirect();

    $schedule->refresh();

    expect($schedule->completed_at)->not->toBeNull()
        ->and($schedule->completed_by)->toBe($this->user->id)
        ->and($schedule->status->code)->toBe('selesai');
});

test('a usage log can be recorded for a vehicle', function () {
    $this->actingAs($this->user);

    $vehicle = Vehicle::factory()->create();
    $driver = User::factory()->create();

    $this->post(route('vehicles.usage-logs.store'), [
        'vehicle_id' => $vehicle->id,
        'driver_id' => $driver->id,
        'usage_date' => now()->toDateString(),
        'start_odometer' => 1000,
        'end_odometer' => 1050,
    ])->assertRedirect(route('vehicles.usage-logs.index'));

    $this->assertDatabaseHas('vehicle_usage_logs', [
        'vehicle_id' => $vehicle->id,
        'driver_id' => $driver->id,
        'start_odometer' => 1000,
        'end_odometer' => 1050,
    ]);
});

test('usage log end odometer must not be less than start odometer', function () {
    $this->actingAs($this->user);

    $vehicle = Vehicle::factory()->create();
    $driver = User::factory()->create();

    $this->post(route('vehicles.usage-logs.store'), [
        'vehicle_id' => $vehicle->id,
        'driver_id' => $driver->id,
        'usage_date' => now()->toDateString(),
        'start_odometer' => 1000,
        'end_odometer' => 900,
    ])->assertSessionHasErrors('end_odometer');
});
