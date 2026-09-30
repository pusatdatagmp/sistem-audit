<?php

use App\Models\Role;
use Database\Seeders\RoleSeeder;

test('registration screen can be rendered', function () {
    $response = $this->get('/register');

    $response->assertStatus(200);
});

test('new users can register', function () {
    $this->seed(RoleSeeder::class);

    $response = $this->post('/register', [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();

    // Self-registered users default to the reporter role, so they land on the portal, not the admin dashboard.
    expect(auth()->user()->role->code)->toBe(Role::CODE_REPORTER);
    $response->assertRedirect(route('portal.index', absolute: false));
});
