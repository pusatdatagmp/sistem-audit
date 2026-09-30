<?php

namespace App\Services\Vehicle;

use App\Models\MasterDataOption;
use App\Models\User;
use App\Models\VehicleInspection;
use Illuminate\Support\Facades\DB;

class VehicleInspectionService
{
    /**
     * @param  array{vehicle_id: int, odometer?: int|null, notes?: string|null, items: list<array{component_option_id: int, condition_code: string, notes?: string|null}>}  $data
     */
    public function record(array $data, User $inspector): VehicleInspection
    {
        $conditionsByCode = MasterDataOption::ofGroup('physical_condition')->pluck('id', 'code');

        return DB::transaction(function () use ($data, $inspector, $conditionsByCode) {
            $inspection = VehicleInspection::create([
                'vehicle_id' => $data['vehicle_id'],
                'inspected_by' => $inspector->id,
                'inspected_at' => now(),
                'odometer' => $data['odometer'] ?? null,
                'notes' => $data['notes'] ?? null,
            ]);

            foreach ($data['items'] as $item) {
                $inspection->items()->create([
                    'component_option_id' => $item['component_option_id'],
                    'condition_option_id' => $conditionsByCode[$item['condition_code']],
                    'notes' => $item['notes'] ?? null,
                ]);
            }

            return $inspection;
        });
    }
}
