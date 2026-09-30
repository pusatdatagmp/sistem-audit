<?php

namespace App\Models;

use Database\Factories\VehicleFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vehicle extends Model
{
    /** @use HasFactory<VehicleFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'plate_number',
        'vehicle_type_option_id',
        'status_option_id',
        'home_kitchen_id',
        'brand',
        'model',
        'year',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function vehicleType(): BelongsTo
    {
        return $this->belongsTo(MasterDataOption::class, 'vehicle_type_option_id');
    }

    public function status(): BelongsTo
    {
        return $this->belongsTo(MasterDataOption::class, 'status_option_id');
    }

    public function homeKitchen(): BelongsTo
    {
        return $this->belongsTo(Kitchen::class, 'home_kitchen_id');
    }

    public function maintenanceSchedules(): HasMany
    {
        return $this->hasMany(VehicleMaintenanceSchedule::class);
    }

    public function usageLogs(): HasMany
    {
        return $this->hasMany(VehicleUsageLog::class);
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(ComplaintTicket::class, 'related_vehicle_id');
    }

    public function inspections(): HasMany
    {
        return $this->hasMany(VehicleInspection::class);
    }
}
