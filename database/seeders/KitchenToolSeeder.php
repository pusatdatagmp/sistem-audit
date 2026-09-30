<?php

namespace Database\Seeders;

use App\Models\Kitchen;
use App\Models\KitchenTool;
use App\Models\MasterDataOption;
use App\Models\User;
use App\Services\Inventory\StockMutationService;
use Illuminate\Database\Seeder;

class KitchenToolSeeder extends Seeder
{
    /**
     * @var list<array{code: string, name: string, unit: string, category: string}>
     */
    private const TOOLS = [
        ['code' => 'ALT-0001', 'name' => 'Panci Besar', 'unit' => 'pcs', 'category' => 'Alat Masak'],
        ['code' => 'ALT-0002', 'name' => 'Wajan', 'unit' => 'pcs', 'category' => 'Alat Masak'],
        ['code' => 'ALT-0003', 'name' => 'Termos Nasi', 'unit' => 'pcs', 'category' => 'Alat Penyimpanan'],
        ['code' => 'ALT-0004', 'name' => 'Nampan Saji', 'unit' => 'pcs', 'category' => 'Alat Saji'],
        ['code' => 'ALT-0005', 'name' => 'Sikat Cuci', 'unit' => 'pcs', 'category' => 'Alat Kebersihan'],
    ];

    /**
     * Run the database seeds.
     */
    public function run(StockMutationService $stockMutationService): void
    {
        $actor = User::query()->first();

        if (! $actor) {
            return;
        }

        foreach (self::TOOLS as $definition) {
            $category = MasterDataOption::ofGroup('kitchen_tool_category')->where('label', $definition['category'])->first();

            if (! $category) {
                continue;
            }

            $tool = KitchenTool::updateOrCreate(
                ['code' => $definition['code']],
                [
                    'name' => $definition['name'],
                    'unit' => $definition['unit'],
                    'category_option_id' => $category->id,
                    'is_active' => true,
                ],
            );

            foreach (Kitchen::all() as $kitchen) {
                $inventory = $tool->inventories()->firstOrCreate(['kitchen_id' => $kitchen->id]);

                if ($inventory->wasRecentlyCreated) {
                    $stockMutationService->stockIn($inventory, 10, 'baik', $actor, 'Stok awal (seeder).');
                }
            }
        }
    }
}
