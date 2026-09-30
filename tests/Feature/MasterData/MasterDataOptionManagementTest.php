<?php

use App\Models\KitchenTool;
use App\Models\MasterDataGroup;
use App\Models\MasterDataOption;
use App\Models\User;
use Database\Seeders\MasterDataSeeder;

beforeEach(function () {
    $this->seed(MasterDataSeeder::class);
    $this->user = User::factory()->create();
});

test('a new option group can be created and is unlocked by default', function () {
    $this->actingAs($this->user);

    $this->post(route('master-data.option-groups.store'), [
        'code' => 'test_group',
        'name' => 'Grup Uji',
    ])->assertRedirect();

    $this->assertDatabaseHas('master_data_groups', ['code' => 'test_group', 'is_locked' => false]);
});

test('a locked group cannot be deleted', function () {
    $this->actingAs($this->user);

    $group = MasterDataGroup::where('code', 'kitchen_tool_category')->firstOrFail();

    $this->delete(route('master-data.option-groups.destroy', $group->code))->assertSessionHasErrors('group');

    $this->assertDatabaseHas('master_data_groups', ['id' => $group->id]);
});

test('adding an option auto-generates a unique slug code from the label', function () {
    $this->actingAs($this->user);

    $group = MasterDataGroup::where('code', 'kitchen_tool_category')->firstOrFail();

    $this->post(route('master-data.options.store', $group->code), [
        'label' => 'Alat Makan',
    ])->assertRedirect();

    $this->assertDatabaseHas('master_data_options', [
        'master_data_group_id' => $group->id,
        'code' => 'alat-makan',
        'label' => 'Alat Makan',
    ]);
});

test('updating an option changes the label but never the code', function () {
    $this->actingAs($this->user);

    $option = MasterDataOption::ofGroup('kitchen_tool_category')->first();
    $originalCode = $option->code;

    $this->put(route('master-data.options.update', $option), [
        'label' => 'Label Baru',
        'sort_order' => 5,
        'is_active' => true,
    ])->assertRedirect();

    $option->refresh();

    expect($option->label)->toBe('Label Baru')
        ->and($option->code)->toBe($originalCode);
});

test('options in the physical_condition group cannot be deleted', function () {
    $this->actingAs($this->user);

    $option = MasterDataOption::ofGroup('physical_condition')->where('code', 'baik')->firstOrFail();

    $this->delete(route('master-data.options.destroy', $option))->assertSessionHasErrors('option');

    $this->assertDatabaseHas('master_data_options', ['id' => $option->id]);
});

test('new options cannot be added to the physical_condition group', function () {
    $this->actingAs($this->user);

    $group = MasterDataGroup::where('code', 'physical_condition')->firstOrFail();

    $this->post(route('master-data.options.store', $group->code), [
        'label' => 'Hilang',
    ])->assertSessionHasErrors('option');

    $this->assertDatabaseMissing('master_data_options', ['master_data_group_id' => $group->id, 'label' => 'Hilang']);
});

test('options in the physical_condition group cannot be updated', function () {
    $this->actingAs($this->user);

    $option = MasterDataOption::ofGroup('physical_condition')->where('code', 'baik')->firstOrFail();

    $this->put(route('master-data.options.update', $option), [
        'label' => 'Label Baru',
        'sort_order' => 0,
        'is_active' => true,
    ])->assertSessionHasErrors('option');

    expect($option->fresh()->label)->toBe('Baik');
});

test('an option still referenced by other data cannot be deleted', function () {
    $this->actingAs($this->user);

    $category = MasterDataOption::ofGroup('kitchen_tool_category')->first();
    KitchenTool::factory()->create(['category_option_id' => $category->id]);

    $this->delete(route('master-data.options.destroy', $category))->assertSessionHasErrors('option');

    $this->assertDatabaseHas('master_data_options', ['id' => $category->id]);
});

test('an unused option can be deleted', function () {
    $this->actingAs($this->user);

    $group = MasterDataGroup::where('code', 'kitchen_tool_category')->firstOrFail();
    $option = $group->options()->create(['code' => 'sementara', 'label' => 'Sementara', 'sort_order' => 99]);

    $this->delete(route('master-data.options.destroy', $option))->assertRedirect();

    $this->assertDatabaseMissing('master_data_options', ['id' => $option->id]);
});
