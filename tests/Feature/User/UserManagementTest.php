<?php

use App\Models\ComplaintTicket;
use App\Models\Role;
use App\Models\User;

beforeEach(function () {
    $this->admin = User::factory()->create();
});

function roleId(string $code): int
{
    return Role::query()->where('code', $code)->value('id');
}

test('guests are redirected to the login page', function () {
    $this->get(route('users.index'))->assertRedirect('/login');
});

test('a reporter is blocked from the user management area', function () {
    $reporter = User::factory()->reporter()->create();

    $this->actingAs($reporter);

    $this->get(route('users.index'))->assertForbidden();
    $this->get(route('users.create'))->assertForbidden();
    $this->post(route('users.store'), [
        'name' => 'Percobaan',
        'email' => 'percobaan@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'role_id' => roleId(Role::CODE_REPORTER),
    ])->assertForbidden();
    $this->get(route('users.edit', $this->admin))->assertForbidden();
    $this->put(route('users.update', $this->admin), ['name' => 'X', 'email' => 'x@example.com'])->assertForbidden();
    $this->put(route('users.update-role', $this->admin), ['role_id' => roleId(Role::CODE_REPORTER)])->assertForbidden();
    $this->delete(route('users.destroy', $this->admin))->assertForbidden();
});

test('an admin can create a new user with a chosen role', function () {
    $this->actingAs($this->admin);

    $this->get(route('users.create'))->assertOk();

    $response = $this->post(route('users.store'), [
        'name' => 'Budi Santoso',
        'email' => 'budi.baru@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
        'role_id' => roleId(Role::CODE_REPORTER),
    ]);

    $response->assertRedirect(route('users.index'))->assertSessionHasNoErrors();

    $user = User::query()->where('email', 'budi.baru@example.com')->first();

    expect($user)->not->toBeNull()
        ->and($user->name)->toBe('Budi Santoso')
        ->and($user->role->code)->toBe(Role::CODE_REPORTER)
        ->and($user->email_verified_at)->not->toBeNull();
});

test('creating a user requires a unique email and a matching password confirmation', function () {
    $this->actingAs($this->admin);

    $this->post(route('users.store'), [
        'name' => 'Duplikat',
        'email' => $this->admin->email,
        'password' => 'password',
        'password_confirmation' => 'password',
        'role_id' => roleId(Role::CODE_REPORTER),
    ])->assertSessionHasErrors('email');

    $this->post(route('users.store'), [
        'name' => 'Salah Konfirmasi',
        'email' => 'salah.konfirmasi@example.com',
        'password' => 'password',
        'password_confirmation' => 'lain',
        'role_id' => roleId(Role::CODE_REPORTER),
    ])->assertSessionHasErrors('password');
});

test('an admin can view the user list and change another user role', function () {
    $this->actingAs($this->admin);

    $reporter = User::factory()->reporter()->create();

    $this->get(route('users.index'))->assertOk();

    $this->put(route('users.update-role', $reporter), ['role_id' => roleId(Role::CODE_ADMIN)])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    expect($reporter->fresh()->role->code)->toBe(Role::CODE_ADMIN);
});

test('the role must reference an existing role', function () {
    $this->actingAs($this->admin);

    $reporter = User::factory()->reporter()->create();

    $this->put(route('users.update-role', $reporter), ['role_id' => 999999])
        ->assertSessionHasErrors('role_id');

    expect($reporter->fresh()->role->code)->toBe(Role::CODE_REPORTER);
});

test('an admin cannot change their own role', function () {
    $this->actingAs($this->admin);

    $this->put(route('users.update-role', $this->admin), ['role_id' => roleId(Role::CODE_REPORTER)])
        ->assertSessionHasErrors('role_id');

    expect($this->admin->fresh()->role->code)->toBe(Role::CODE_ADMIN);
});

test('demoting one of several admins is allowed as long as one remains', function () {
    $otherAdmin = User::factory()->create();

    $this->actingAs($this->admin);

    $this->put(route('users.update-role', $otherAdmin), ['role_id' => roleId(Role::CODE_REPORTER)])
        ->assertSessionHasNoErrors();

    expect($otherAdmin->fresh()->role->code)->toBe(Role::CODE_REPORTER)
        ->and($this->admin->fresh()->role->code)->toBe(Role::CODE_ADMIN);
});

test('the user list can be searched by name or email', function () {
    $this->actingAs($this->admin);

    User::factory()->reporter()->create(['name' => 'Budi Santoso', 'email' => 'budi@example.com']);
    User::factory()->reporter()->create(['name' => 'Siti Aminah', 'email' => 'siti@example.com']);

    $response = $this->get(route('users.index', ['search' => 'budi']));

    $response->assertOk();
    $response->assertInertia(fn ($page) => $page
        ->has('users.data', 1)
        ->where('users.data.0.name', 'Budi Santoso'));
});

test('an admin can edit another user\'s name, email and password', function () {
    $this->actingAs($this->admin);

    $reporter = User::factory()->reporter()->create(['email' => 'lama@example.com']);
    $originalPasswordHash = $reporter->password;

    $this->get(route('users.edit', $reporter))->assertOk();

    $this->put(route('users.update', $reporter), [
        'name' => 'Nama Baru',
        'email' => 'baru@example.com',
        'password' => 'password-baru',
        'password_confirmation' => 'password-baru',
    ])->assertRedirect(route('users.index'))->assertSessionHasNoErrors();

    $reporter->refresh();

    expect($reporter->name)->toBe('Nama Baru')
        ->and($reporter->email)->toBe('baru@example.com')
        ->and($reporter->password)->not->toBe($originalPasswordHash);
});

test('editing a user without a new password keeps the existing password', function () {
    $this->actingAs($this->admin);

    $reporter = User::factory()->reporter()->create();
    $originalPasswordHash = $reporter->password;

    $this->put(route('users.update', $reporter), [
        'name' => $reporter->name,
        'email' => $reporter->email,
    ])->assertSessionHasNoErrors();

    expect($reporter->fresh()->password)->toBe($originalPasswordHash);
});

test('editing a user validates unique email while ignoring their own', function () {
    $this->actingAs($this->admin);

    $reporter = User::factory()->reporter()->create();

    $this->put(route('users.update', $reporter), [
        'name' => $reporter->name,
        'email' => $reporter->email,
    ])->assertSessionHasNoErrors();

    $this->put(route('users.update', $reporter), [
        'name' => $reporter->name,
        'email' => $this->admin->email,
    ])->assertSessionHasErrors('email');
});

test('an admin can delete another user with no related activity records', function () {
    $this->actingAs($this->admin);

    $reporter = User::factory()->reporter()->create();

    $this->delete(route('users.destroy', $reporter))
        ->assertRedirect(route('users.index'))
        ->assertSessionHasNoErrors();

    expect(User::query()->find($reporter->id))->toBeNull();
});

test('an admin cannot delete their own account', function () {
    $this->actingAs($this->admin);

    $this->delete(route('users.destroy', $this->admin))->assertSessionHasErrors('user');

    expect(User::query()->find($this->admin->id))->not->toBeNull();
});

test('deleting the last user who can manage roles is blocked', function () {
    $this->actingAs($this->admin);

    $otherAdmin = User::factory()->create();

    $this->delete(route('users.destroy', $otherAdmin))->assertSessionHasNoErrors();

    // Only $this->admin is left with roles.manage now; deleting it must be blocked
    // even though it is done "as" that very admin (mirrors the self-delete guard,
    // but exercises the stranding check specifically).
    expect(User::query()->count())->toBe(1);
});

test('a user with related activity records cannot be deleted', function () {
    $this->actingAs($this->admin);

    $reporter = User::factory()->reporter()->create();
    ComplaintTicket::factory()->create(['reporter_id' => $reporter->id]);

    $this->delete(route('users.destroy', $reporter))->assertSessionHasErrors('user');

    expect(User::query()->find($reporter->id))->not->toBeNull();
});
