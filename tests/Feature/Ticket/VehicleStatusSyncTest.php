<?php

use App\Models\ComplaintTicket;
use App\Models\MasterDataOption;
use App\Models\User;
use App\Models\Vehicle;
use Database\Seeders\MasterDataSeeder;

beforeEach(function () {
    $this->seed(MasterDataSeeder::class);
    $this->user = User::factory()->create();
    $this->vehicleIssueCategory = MasterDataOption::ofGroup('complaint_category')->where('code', 'kendala-kendaraan')->firstOrFail();
    $this->otherCategory = MasterDataOption::ofGroup('complaint_category')->where('code', 'kerusakan-alat-dapur')->firstOrFail();
    $this->priority = MasterDataOption::ofGroup('ticket_priority')->first();
    $this->activeStatus = MasterDataOption::ofGroup('vehicle_status')->where('code', 'aktif')->firstOrFail();
    $this->inRepairStatus = MasterDataOption::ofGroup('vehicle_status')->where('code', 'dalam-perbaikan')->firstOrFail();
    $this->inactiveStatus = MasterDataOption::ofGroup('vehicle_status')->where('code', 'nonaktif')->firstOrFail();
});

test('creating a vehicle-issue ticket marks the vehicle as under repair', function () {
    $this->actingAs($this->user);

    $vehicle = Vehicle::factory()->create(['status_option_id' => $this->activeStatus->id]);

    $this->post(route('tickets.store'), [
        'category_option_id' => $this->vehicleIssueCategory->id,
        'priority_option_id' => $this->priority->id,
        'related_vehicle_id' => $vehicle->id,
        'subject' => 'Ban bocor di jalan',
        'description' => 'Ban depan bocor saat pengiriman.',
    ]);

    expect($vehicle->fresh()->status_option_id)->toBe($this->inRepairStatus->id);
});

test('creating a non-vehicle ticket does not touch any vehicle status', function () {
    $this->actingAs($this->user);

    $vehicle = Vehicle::factory()->create(['status_option_id' => $this->activeStatus->id]);

    $this->post(route('tickets.store'), [
        'category_option_id' => $this->otherCategory->id,
        'priority_option_id' => $this->priority->id,
        'subject' => 'Panci penyok',
        'description' => 'Panci besar penyok karena jatuh.',
    ]);

    expect($vehicle->fresh()->status_option_id)->toBe($this->activeStatus->id);
});

test('resolving the only open vehicle ticket reverts the vehicle back to active', function () {
    $this->actingAs($this->user);

    $vehicle = Vehicle::factory()->create(['status_option_id' => $this->inRepairStatus->id]);
    $ticket = ComplaintTicket::factory()->create([
        'category_option_id' => $this->vehicleIssueCategory->id,
        'related_vehicle_id' => $vehicle->id,
        'status' => ComplaintTicket::STATUS_IN_PROGRESS,
    ]);

    $this->post(route('tickets.update-status', $ticket), [
        'status' => ComplaintTicket::STATUS_RESOLVED,
    ]);

    expect($vehicle->fresh()->status_option_id)->toBe($this->activeStatus->id);
});

test('resolving one of two open vehicle tickets keeps the vehicle under repair', function () {
    $this->actingAs($this->user);

    $vehicle = Vehicle::factory()->create(['status_option_id' => $this->inRepairStatus->id]);

    $ticketOne = ComplaintTicket::factory()->create([
        'category_option_id' => $this->vehicleIssueCategory->id,
        'related_vehicle_id' => $vehicle->id,
        'status' => ComplaintTicket::STATUS_OPEN,
    ]);

    ComplaintTicket::factory()->create([
        'category_option_id' => $this->vehicleIssueCategory->id,
        'related_vehicle_id' => $vehicle->id,
        'status' => ComplaintTicket::STATUS_IN_PROGRESS,
    ]);

    $this->post(route('tickets.update-status', $ticketOne), [
        'status' => ComplaintTicket::STATUS_RESOLVED,
    ]);

    expect($vehicle->fresh()->status_option_id)->toBe($this->inRepairStatus->id);
});

test('resolving a vehicle ticket does not override a manually set inactive status', function () {
    $this->actingAs($this->user);

    $vehicle = Vehicle::factory()->create(['status_option_id' => $this->inactiveStatus->id]);
    $ticket = ComplaintTicket::factory()->create([
        'category_option_id' => $this->vehicleIssueCategory->id,
        'related_vehicle_id' => $vehicle->id,
        'status' => ComplaintTicket::STATUS_IN_PROGRESS,
    ]);

    $this->post(route('tickets.update-status', $ticket), [
        'status' => ComplaintTicket::STATUS_RESOLVED,
    ]);

    expect($vehicle->fresh()->status_option_id)->toBe($this->inactiveStatus->id);
});
