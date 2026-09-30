<?php

namespace Database\Seeders;

use App\Models\MasterDataOption;
use App\Models\Vehicle;
use Illuminate\Database\Seeder;

class VehicleSeeder extends Seeder
{
    /**
     * @var list<array{plate_number: string, type: string, brand: string, model: string, year: int}>
     */
    private const VEHICLES = [
        ['plate_number' => 'B 1234 ABC', 'type' => 'Truck Box', 'brand' => 'Mitsubishi', 'model' => 'Colt Diesel', 'year' => 2021],
        ['plate_number' => 'B 5678 DEF', 'type' => 'Pickup', 'brand' => 'Toyota', 'model' => 'Hilux', 'year' => 2020],
        ['plate_number' => 'B 9012 GHI', 'type' => 'Van', 'brand' => 'Daihatsu', 'model' => 'Gran Max', 'year' => 2022],
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $activeStatus = MasterDataOption::ofGroup('vehicle_status')->where('code', 'aktif')->first();

        foreach (self::VEHICLES as $vehicle) {
            $type = MasterDataOption::ofGroup('vehicle_type')->where('label', $vehicle['type'])->first();

            if (! $type || ! $activeStatus) {
                continue;
            }

            Vehicle::updateOrCreate(
                ['plate_number' => $vehicle['plate_number']],
                [
                    'vehicle_type_option_id' => $type->id,
                    'status_option_id' => $activeStatus->id,
                    'brand' => $vehicle['brand'],
                    'model' => $vehicle['model'],
                    'year' => $vehicle['year'],
                    'is_active' => true,
                ],
            );
        }
    }
}
