<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(PermissionSeeder::class);

        $admin = Role::updateOrCreate(
            ['code' => Role::CODE_ADMIN],
            ['name' => 'Admin', 'description' => 'Akses penuh ke seluruh modul.', 'is_locked' => true],
        );
        $admin->permissions()->sync(Permission::query()->pluck('id'));

        $reporter = Role::updateOrCreate(
            ['code' => Role::CODE_REPORTER],
            ['name' => 'Reporter', 'description' => 'Staf yang melaporkan keluhan lewat portal pengaduan.', 'is_locked' => true],
        );
        $reporter->permissions()->sync([]);

        $driver = Role::updateOrCreate(
            ['code' => Role::CODE_DRIVER],
            ['name' => 'Driver', 'description' => 'Pengemudi yang mencatat riwayat pemakaian kendaraan miliknya sendiri.', 'is_locked' => true],
        );
        $driver->permissions()->sync(
            Permission::query()->where('code', Permission::DRIVER_PORTAL_ACCESS)->pluck('id')
        );
    }
}
