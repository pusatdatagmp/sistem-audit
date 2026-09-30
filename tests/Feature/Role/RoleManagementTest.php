<?php

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;

beforeEach(function () {
    $this->admin = User::factory()->create();
});

test('guests are redirected to the login page', function () {
    $this->get(route('roles.index'))->assertRedirect('/login');
});

test('a reporter is blocked from the roles area', function () {
    $reporter = User::factory()->reporter()->create();

    $this->actingAs($reporter);

    $this->get(route('roles.index'))->assertForbidden();
});

test('an admin can create a custom role with selected permissions', function () {
    $this->actingAs($this->admin);

    $permission = Permission::query()->where('code', Permission::INVENTORY_MANAGE)->firstOrFail();

    $this->post(route('roles.store'), [
        'code' => 'kepala-dapur',
        'name' => 'Kepala Dapur',
        'description' => 'Mengelola inventaris dapur.',
        'permissions' => [$permission->id],
    ])->assertRedirect(route('roles.index'));

    $role = Role::where('code', 'kepala-dapur')->firstOrFail();

    expect($role->name)->toBe('Kepala Dapur')
        ->and($role->is_locked)->toBeFalse()
        ->and($role->hasPermission(Permission::INVENTORY_MANAGE))->toBeTrue();
});

test('a role code must be unique', function () {
    $this->actingAs($this->admin);

    $this->post(route('roles.store'), [
        'code' => 'admin',
        'name' => 'Duplikat',
        'permissions' => [],
    ])->assertSessionHasErrors('code');
});

test('an admin can rename a role and change its permissions', function () {
    $this->actingAs($this->admin);

    $role = Role::factory()->create(['is_locked' => false]);
    $permission = Permission::query()->where('code', Permission::TICKETS_MANAGE)->firstOrFail();

    $this->put(route('roles.update', $role), [
        'name' => 'Nama Baru',
        'description' => 'Deskripsi baru.',
        'permissions' => [$permission->id],
    ])->assertRedirect(route('roles.index'));

    $role->refresh();

    expect($role->name)->toBe('Nama Baru')
        ->and($role->hasPermission(Permission::TICKETS_MANAGE))->toBeTrue();
});

test('a system role cannot be deleted', function () {
    $this->actingAs($this->admin);

    $reporterRole = Role::where('code', Role::CODE_REPORTER)->firstOrFail();

    $this->delete(route('roles.destroy', $reporterRole))->assertSessionHasErrors('role');

    expect(Role::find($reporterRole->id))->not->toBeNull();
});

test('a custom role still assigned to users cannot be deleted', function () {
    $this->actingAs($this->admin);

    $role = Role::factory()->create(['is_locked' => false]);
    User::factory()->create(['role_id' => $role->id]);

    $this->delete(route('roles.destroy', $role))->assertSessionHasErrors('role');

    expect(Role::find($role->id))->not->toBeNull();
});

test('an unused custom role can be deleted', function () {
    $this->actingAs($this->admin);

    $role = Role::factory()->create(['is_locked' => false]);

    $this->delete(route('roles.destroy', $role))->assertRedirect(route('roles.index'));

    expect(Role::find($role->id))->toBeNull();
});

test('stripping the only permission that grants roles.manage is blocked while a role still has users', function () {
    $manager = Role::factory()->create(['name' => 'Manager', 'is_locked' => false]);
    $rolesManageId = Permission::where('code', Permission::ROLES_MANAGE)->value('id');
    $manager->permissions()->sync([$rolesManageId]);

    $user = User::factory()->create(['role_id' => $manager->id]);

    $this->actingAs($user);

    $admin = Role::where('code', Role::CODE_ADMIN)->firstOrFail();

    // Allowed: the Manager role (with $user assigned) still covers roles.manage.
    $this->put(route('roles.update', $admin), [
        'name' => $admin->name,
        'description' => $admin->description,
        'permissions' => $admin->permissions()->where('code', '!=', Permission::ROLES_MANAGE)->pluck('id')->all(),
    ])->assertSessionHasNoErrors();

    // Blocked: Manager is now the only role granting roles.manage.
    $this->put(route('roles.update', $manager), [
        'name' => 'Manager',
        'permissions' => [],
    ])->assertSessionHasErrors('permissions');

    expect($manager->fresh()->hasPermission(Permission::ROLES_MANAGE))->toBeTrue();
});
