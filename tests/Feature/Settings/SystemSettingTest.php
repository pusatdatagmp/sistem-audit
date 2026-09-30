<?php

use App\Models\AppSetting;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('public');
});

test('guests are redirected to the login page', function () {
    $this->get(route('system-settings.edit'))->assertRedirect('/login');
});

test('a reporter is blocked from the system settings area', function () {
    $this->actingAs(User::factory()->reporter()->create());

    $this->get(route('system-settings.edit'))->assertForbidden();
    $this->post(route('system-settings.update'), ['primary_color' => '#2563eb'])->assertForbidden();
});

test('an admin can view the system settings page', function () {
    $this->actingAs(User::factory()->create());

    $this->get(route('system-settings.edit'))->assertOk();
});

test('an admin can upload a logo and set a primary color', function () {
    $this->actingAs(User::factory()->create());

    $logo = UploadedFile::fake()->image('logo.png', 200, 200);

    $this->post(route('system-settings.update'), [
        'logo' => $logo,
        'primary_color' => '#2563EB',
    ])->assertRedirect()->assertSessionHasNoErrors();

    $setting = AppSetting::current();

    expect($setting->logo_path)->not->toBeNull()
        ->and($setting->primary_color)->toBe('#2563EB')
        ->and($setting->logo_url)->toContain('/storage/');

    Storage::disk('public')->assertExists($setting->logo_path);
});

test('uploading a new logo removes the previous file', function () {
    $this->actingAs(User::factory()->create());

    $this->post(route('system-settings.update'), ['logo' => UploadedFile::fake()->image('first.png')]);
    $firstPath = AppSetting::current()->logo_path;

    $this->post(route('system-settings.update'), ['logo' => UploadedFile::fake()->image('second.png')]);
    $secondPath = AppSetting::current()->logo_path;

    expect($secondPath)->not->toBe($firstPath);
    Storage::disk('public')->assertMissing($firstPath);
    Storage::disk('public')->assertExists($secondPath);
});

test('an admin can remove the logo', function () {
    $this->actingAs(User::factory()->create());

    $this->post(route('system-settings.update'), ['logo' => UploadedFile::fake()->image('logo.png')]);
    $path = AppSetting::current()->logo_path;

    $this->post(route('system-settings.update'), ['remove_logo' => true])->assertSessionHasNoErrors();

    expect(AppSetting::current()->logo_path)->toBeNull();
    Storage::disk('public')->assertMissing($path);
});

test('clearing the primary color reverts to the default theme', function () {
    $this->actingAs(User::factory()->create());

    $this->post(route('system-settings.update'), ['primary_color' => '#2563eb']);
    expect(AppSetting::current()->primary_color)->toBe('#2563eb');

    $this->post(route('system-settings.update'), ['primary_color' => ''])->assertSessionHasNoErrors();
    expect(AppSetting::current()->primary_color)->toBeNull();
});

test('an invalid hex color is rejected', function () {
    $this->actingAs(User::factory()->create());

    $this->post(route('system-settings.update'), ['primary_color' => 'not-a-color'])
        ->assertSessionHasErrors('primary_color');
});

test('a non image file is rejected as a logo', function () {
    $this->actingAs(User::factory()->create());

    $this->post(route('system-settings.update'), ['logo' => UploadedFile::fake()->create('logo.pdf', 100)])
        ->assertSessionHasErrors('logo');
});
