<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        foreach (Permission::CATALOG as $code => $attributes) {
            Permission::updateOrCreate(['code' => $code], $attributes);
        }
    }
}
