<?php

namespace Database\Seeders;

use App\Models\Kitchen;
use Illuminate\Database\Seeder;

class KitchenSeeder extends Seeder
{
    /**
     * @var list<array{code: string, name: string}>
     */
    private const KITCHENS = [
        ['code' => 'DPR-01', 'name' => 'Dapur Pusat'],
        ['code' => 'DPR-02', 'name' => 'Dapur Cabang Utara'],
        ['code' => 'DPR-03', 'name' => 'Dapur Cabang Selatan'],
        ['code' => 'DPR-04', 'name' => 'Dapur Cabang Timur'],
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach (self::KITCHENS as $kitchen) {
            Kitchen::updateOrCreate(
                ['code' => $kitchen['code']],
                ['name' => $kitchen['name'], 'is_active' => true],
            );
        }
    }
}
