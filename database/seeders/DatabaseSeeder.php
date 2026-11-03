<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        if (app()->isProduction()) {
            $this->command?->error('DatabaseSeeder berisi data dummy dan tidak boleh dijalankan di production. Gunakan: php artisan db:seed --class=RoleSeeder --force');

            return;
        }

        $this->call(RoleSeeder::class);

        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'role_id' => Role::where('code', Role::CODE_ADMIN)->value('id'),
        ]);

        User::factory()->create([
            'name' => 'Staf Pelapor',
            'email' => 'staff@example.com',
            'role_id' => Role::where('code', Role::CODE_REPORTER)->value('id'),
        ]);

        User::factory()->create([
            'name' => 'Driver Contoh',
            'email' => 'driver@example.com',
            'role_id' => Role::where('code', Role::CODE_DRIVER)->value('id'),

        ]);

        $this->call([
            MasterDataSeeder::class,
            KitchenSeeder::class,
            VehicleSeeder::class,
            KitchenToolSeeder::class,
            DashboardSeeder::class,
        ]);
    }
}
