<?php

use App\Models\ComplaintTicket;
use App\Models\Kitchen;
use App\Models\MasterDataOption;
use App\Models\User;
use Database\Seeders\MasterDataSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->seed(MasterDataSeeder::class);
    $this->reporter = User::factory()->reporter()->create();
});

test('guests are redirected to the login page', function () {
    $this->get(route('portal.index'))->assertRedirect('/login');
});

test('a reporter can view their own tickets and submit a new one', function () {
    Storage::fake('public');

    $this->actingAs($this->reporter);

    $category = MasterDataOption::ofGroup('complaint_category')->first();
    $priority = MasterDataOption::ofGroup('ticket_priority')->first();
    $kitchen = Kitchen::factory()->create();

    $this->get(route('portal.index'))->assertOk();
    $this->get(route('portal.create'))->assertOk();

    $response = $this->post(route('portal.store'), [
        'kitchen_id' => $kitchen->id,
        'category_option_id' => $category->id,
        'priority_option_id' => $priority->id,
        'subject' => 'Kompor tidak menyala',
        'description' => 'Sudah dicoba beberapa kali tetap tidak menyala.',
        'photo' => UploadedFile::fake()->image('bukti.jpg'),
    ]);

    $ticket = ComplaintTicket::where('reporter_id', $this->reporter->id)->firstOrFail();

    $response->assertRedirect(route('portal.show', $ticket));
    $this->get(route('portal.show', $ticket))->assertOk();
});

test('a reporter can submit a report with a photo', function () {
    Storage::fake('public');

    $this->actingAs($this->reporter);

    $category = MasterDataOption::ofGroup('complaint_category')->first();
    $priority = MasterDataOption::ofGroup('ticket_priority')->first();
    $kitchen = Kitchen::factory()->create();

    $this->post(route('portal.store'), [
        'kitchen_id' => $kitchen->id,
        'category_option_id' => $category->id,
        'priority_option_id' => $priority->id,
        'subject' => 'Kompor tidak menyala',
        'description' => 'Sudah dicoba beberapa kali tetap tidak menyala.',
        'photo' => UploadedFile::fake()->image('bukti.jpg'),
    ])->assertSessionHasNoErrors();

    $ticket = ComplaintTicket::where('reporter_id', $this->reporter->id)->firstOrFail();

    expect($ticket->photo_path)->not->toBeNull()
        ->and($ticket->photo_url)->toContain('/storage/');

    Storage::disk('public')->assertExists($ticket->photo_path);
});

test('submitting a report without a photo is rejected', function () {
    $this->actingAs($this->reporter);

    $category = MasterDataOption::ofGroup('complaint_category')->first();
    $priority = MasterDataOption::ofGroup('ticket_priority')->first();
    $kitchen = Kitchen::factory()->create();

    $this->post(route('portal.store'), [
        'kitchen_id' => $kitchen->id,
        'category_option_id' => $category->id,
        'priority_option_id' => $priority->id,
        'subject' => 'Kompor tidak menyala',
        'description' => 'Sudah dicoba beberapa kali tetap tidak menyala.',
    ])->assertSessionHasErrors('photo');

    expect(ComplaintTicket::where('reporter_id', $this->reporter->id)->exists())->toBeFalse();
});

test('a non image file is rejected as the report photo', function () {
    $this->actingAs($this->reporter);

    $category = MasterDataOption::ofGroup('complaint_category')->first();
    $priority = MasterDataOption::ofGroup('ticket_priority')->first();

    $this->post(route('portal.store'), [
        'category_option_id' => $category->id,
        'priority_option_id' => $priority->id,
        'subject' => 'Kompor tidak menyala',
        'description' => 'Sudah dicoba beberapa kali tetap tidak menyala.',
        'photo' => UploadedFile::fake()->create('bukti.pdf', 100),
    ])->assertSessionHasErrors('photo');
});

test('a driver sees their own kitchen pre-attached when opening the report form', function () {
    $kitchen = Kitchen::factory()->create();
    $driver = User::factory()->driver()->create(['kitchen_id' => $kitchen->id]);

    $this->actingAs($driver);

    $this->get(route('portal.create'))->assertInertia(fn ($page) => $page
        ->where('auth.user.kitchen.id', $kitchen->id)
        ->where('auth.user.kitchen.name', $kitchen->name));
});

test('a driver can submit a report using their own attached kitchen', function () {
    Storage::fake('public');

    $kitchen = Kitchen::factory()->create();
    $driver = User::factory()->driver()->create(['kitchen_id' => $kitchen->id]);

    $this->actingAs($driver);

    $category = MasterDataOption::ofGroup('complaint_category')->first();
    $priority = MasterDataOption::ofGroup('ticket_priority')->first();

    $this->post(route('portal.store'), [
        'kitchen_id' => $kitchen->id,
        'category_option_id' => $category->id,
        'priority_option_id' => $priority->id,
        'subject' => 'Jalan rusak di akses dapur',
        'description' => 'Jalan menuju dapur berlubang cukup dalam.',
        'photo' => UploadedFile::fake()->image('bukti.jpg'),
    ])->assertSessionHasNoErrors();

    $ticket = ComplaintTicket::where('reporter_id', $driver->id)->firstOrFail();

    expect($ticket->kitchen_id)->toBe($kitchen->id);
});

test('a reporter cannot view another reporter ticket', function () {
    $this->actingAs($this->reporter);

    $otherReporter = User::factory()->reporter()->create();
    $ticket = ComplaintTicket::factory()->create(['reporter_id' => $otherReporter->id]);

    $this->get(route('portal.show', $ticket))->assertForbidden();
});

test('a reporter is blocked from the admin ticket, inventory, vehicle and master data areas', function () {
    $this->actingAs($this->reporter);

    $this->get(route('dashboard'))->assertForbidden();
    $this->get(route('tickets.index'))->assertForbidden();
    $this->get(route('inventory.index'))->assertForbidden();
    $this->get(route('vehicles.index'))->assertForbidden();
    $this->get(route('master-data.kitchens.index'))->assertForbidden();
});

test('an admin can access the admin areas but a reporter cannot', function () {
    $admin = User::factory()->create();

    $this->actingAs($admin);
    $this->get(route('dashboard'))->assertOk();
    $this->get(route('tickets.index'))->assertOk();
});
