<?php

use App\Models\Kitchen;
use App\Models\KitchenInventory;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
});

test('guests are redirected to the login page', function () {
    $this->get(route('master-data.kitchens.index'))->assertRedirect('/login');
});

test('authenticated users can view and create a kitchen', function () {
    $this->actingAs($this->user);

    $this->get(route('master-data.kitchens.index'))->assertOk();

    $this->post(route('master-data.kitchens.store'), [
        'code' => 'DPR-99',
        'name' => 'Dapur Baru',
    ])->assertRedirect(route('master-data.kitchens.index'));

    $this->assertDatabaseHas('kitchens', ['code' => 'DPR-99', 'name' => 'Dapur Baru']);
});

test('kitchens can be updated', function () {
    $this->actingAs($this->user);

    $kitchen = Kitchen::factory()->create(['name' => 'Dapur Lama']);

    $this->put(route('master-data.kitchens.update', $kitchen), [
        'code' => $kitchen->code,
        'name' => 'Dapur Diperbarui',
        'is_active' => false,
    ])->assertRedirect(route('master-data.kitchens.index'));

    expect($kitchen->fresh()->name)->toBe('Dapur Diperbarui')
        ->and($kitchen->fresh()->is_active)->toBeFalse();
});

test('a kitchen without related data can be deleted', function () {
    $this->actingAs($this->user);

    $kitchen = Kitchen::factory()->create();

    $this->delete(route('master-data.kitchens.destroy', $kitchen))->assertRedirect(route('master-data.kitchens.index'));

    $this->assertDatabaseMissing('kitchens', ['id' => $kitchen->id]);
});

test('a kitchen with inventory history cannot be deleted', function () {
    $this->actingAs($this->user);

    $kitchen = Kitchen::factory()->create();
    KitchenInventory::factory()->create(['kitchen_id' => $kitchen->id]);

    $this->delete(route('master-data.kitchens.destroy', $kitchen))->assertSessionHasErrors('kitchen');

    $this->assertDatabaseHas('kitchens', ['id' => $kitchen->id]);
});
