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
    $this->user = User::factory()->create();
});

test('guests are redirected to the login page', function () {
    $this->get(route('tickets.index'))->assertRedirect('/login');
});

test('a user can create a ticket and gets an auto-generated ticket number', function () {
    Storage::fake('public');

    $this->actingAs($this->user);

    $category = MasterDataOption::ofGroup('complaint_category')->first();
    $priority = MasterDataOption::ofGroup('ticket_priority')->first();
    $kitchen = Kitchen::factory()->create();

    $response = $this->post(route('tickets.store'), [
        'kitchen_id' => $kitchen->id,
        'category_option_id' => $category->id,
        'priority_option_id' => $priority->id,
        'subject' => 'Kompor mati total',
        'description' => 'Kompor di dapur pusat tidak menyala sejak pagi.',
        'photo' => UploadedFile::fake()->image('bukti.jpg'),
    ]);

    $ticket = ComplaintTicket::first();

    $response->assertRedirect(route('tickets.show', $ticket));

    expect($ticket->ticket_number)->toStartWith('TCK-'.now()->format('Ymd'))
        ->and($ticket->status)->toBe(ComplaintTicket::STATUS_OPEN)
        ->and($ticket->reporter_id)->toBe($this->user->id);
});

test('a ticket requires a photo and stores it when provided', function () {
    Storage::fake('public');

    $this->actingAs($this->user);

    $category = MasterDataOption::ofGroup('complaint_category')->first();
    $priority = MasterDataOption::ofGroup('ticket_priority')->first();
    $kitchen = Kitchen::factory()->create();

    $this->post(route('tickets.store'), [
        'kitchen_id' => $kitchen->id,
        'category_option_id' => $category->id,
        'priority_option_id' => $priority->id,
        'subject' => 'Kompor mati total',
        'description' => 'Kompor di dapur pusat tidak menyala sejak pagi.',
    ])->assertSessionHasErrors('photo');

    $this->post(route('tickets.store'), [
        'kitchen_id' => $kitchen->id,
        'category_option_id' => $category->id,
        'priority_option_id' => $priority->id,
        'subject' => 'Kompor mati total',
        'description' => 'Kompor di dapur pusat tidak menyala sejak pagi.',
        'photo' => UploadedFile::fake()->image('bukti.jpg'),
    ])->assertSessionHasNoErrors();

    $ticket = ComplaintTicket::first();

    expect($ticket->photo_path)->not->toBeNull();
    Storage::disk('public')->assertExists($ticket->photo_path);
});

test('ticket status changes are recorded in the activity log', function () {
    $this->actingAs($this->user);

    $ticket = ComplaintTicket::factory()->create(['status' => ComplaintTicket::STATUS_OPEN]);
    $handler = User::factory()->create();

    $this->post(route('tickets.update-status', $ticket), [
        'status' => ComplaintTicket::STATUS_IN_PROGRESS,
        'assigned_to' => $handler->id,
        'note' => 'Sedang ditangani teknisi.',
    ])->assertRedirect();

    $ticket->refresh();

    expect($ticket->status)->toBe(ComplaintTicket::STATUS_IN_PROGRESS)
        ->and($ticket->assigned_to)->toBe($handler->id)
        ->and($ticket->resolved_at)->toBeNull()
        ->and($ticket->updates)->toHaveCount(1)
        ->and($ticket->updates->first()->status_from)->toBe(ComplaintTicket::STATUS_OPEN)
        ->and($ticket->updates->first()->status_to)->toBe(ComplaintTicket::STATUS_IN_PROGRESS);
});

test('resolving a ticket sets resolved_at', function () {
    $this->actingAs($this->user);

    $ticket = ComplaintTicket::factory()->create(['status' => ComplaintTicket::STATUS_IN_PROGRESS]);

    $this->post(route('tickets.update-status', $ticket), [
        'status' => ComplaintTicket::STATUS_RESOLVED,
    ])->assertRedirect();

    expect($ticket->fresh()->resolved_at)->not->toBeNull();
});

test('a ticket can be viewed and updated', function () {
    $this->actingAs($this->user);

    $ticket = ComplaintTicket::factory()->create(['subject' => 'Judul lama']);
    $category = MasterDataOption::ofGroup('complaint_category')->first();
    $priority = MasterDataOption::ofGroup('ticket_priority')->first();
    $kitchen = Kitchen::factory()->create();

    $this->get(route('tickets.show', $ticket))->assertOk();

    $this->put(route('tickets.update', $ticket), [
        'kitchen_id' => $kitchen->id,
        'category_option_id' => $category->id,
        'priority_option_id' => $priority->id,
        'subject' => 'Judul baru',
        'description' => $ticket->description,
    ])->assertRedirect(route('tickets.show', $ticket));

    expect($ticket->fresh()->subject)->toBe('Judul baru');
});
