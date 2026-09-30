<?php

use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleUsageLog;

beforeEach(function () {
    $this->driver = User::factory()->driver()->create();
    $this->vehicle = Vehicle::factory()->create(['is_active' => true]);
});

test('guests are redirected to the login page', function () {
    $this->get(route('driver.index'))->assertRedirect('/login');
});

test('a reporter is blocked from the driver portal', function () {
    $reporter = User::factory()->reporter()->create();

    $this->actingAs($reporter);

    $this->get(route('driver.index'))->assertForbidden();
});

test('a driver can log their own vehicle usage', function () {
    $this->actingAs($this->driver);

    $this->get(route('driver.index'))->assertOk();
    $this->get(route('driver.create'))->assertOk();

    $this->post(route('driver.store'), [
        'vehicle_id' => $this->vehicle->id,
        'usage_date' => '2026-09-29',
        'destination' => 'Kantor Pusat',
        'purpose' => 'Antar logistik',
    ])->assertRedirect(route('driver.index'));

    $log = VehicleUsageLog::where('vehicle_id', $this->vehicle->id)->firstOrFail();

    expect($log->driver_id)->toBe($this->driver->id);
});

test('a driver cannot spoof another user as the driver on the logged trip', function () {
    $this->actingAs($this->driver);

    $otherUser = User::factory()->driver()->create();

    $this->post(route('driver.store'), [
        'vehicle_id' => $this->vehicle->id,
        'driver_id' => $otherUser->id,
        'usage_date' => '2026-09-29',
    ])->assertRedirect(route('driver.index'));

    $log = VehicleUsageLog::where('vehicle_id', $this->vehicle->id)->firstOrFail();

    expect($log->driver_id)->toBe($this->driver->id);
});

test('a driver cannot edit another driver usage log', function () {
    $otherDriver = User::factory()->driver()->create();
    $log = VehicleUsageLog::factory()->create(['driver_id' => $otherDriver->id]);

    $this->actingAs($this->driver);

    $this->get(route('driver.edit', $log))->assertForbidden();
    $this->put(route('driver.update', $log), ['usage_date' => '2026-09-29'])->assertForbidden();
});

test('a driver can edit their own usage log', function () {
    $log = VehicleUsageLog::factory()->create(['driver_id' => $this->driver->id, 'vehicle_id' => $this->vehicle->id]);

    $this->actingAs($this->driver);

    $this->put(route('driver.update', $log), [
        'usage_date' => '2026-09-29',
        'destination' => 'Gudang Utama',
    ])->assertRedirect(route('driver.index'));

    expect($log->fresh()->destination)->toBe('Gudang Utama');
});
