<?php

use App\Models\User;
use Database\Seeders\DatabaseSeeder;

it('refuses to seed dummy data in production', function () {
    app()->detectEnvironment(fn () => 'production');

    $this->artisan('db:seed', ['--class' => DatabaseSeeder::class, '--force' => true])->assertSuccessful();

    expect(User::count())->toBe(0);
});

it('generates https urls when behind the cloudflare tunnel proxy', function () {
    $response = $this->get('/', [
        'X-Forwarded-Proto' => 'https',
        'X-Forwarded-Host' => 'audit.deevatech.my.id',
    ]);

    $response->assertOk();
    expect(request()->isSecure())->toBeTrue()
        ->and(url('/login'))->toBe('https://audit.deevatech.my.id/login');
});
