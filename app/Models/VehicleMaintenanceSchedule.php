<?php

namespace App\Models;

use Database\Factories\VehicleMaintenanceScheduleFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VehicleMaintenanceSchedule extends Model
{
    /** @use HasFactory<VehicleMaintenanceScheduleFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'vehicle_id',
        'maintenance_type_option_id',
        'status_option_id',
        'scheduled_date',
        'odometer_at_schedule',
        'completed_at',
        'completed_by',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_date' => 'date',
            'completed_at' => 'datetime',
        ];
    }

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function maintenanceType(): BelongsTo
    {
        return $this->belongsTo(MasterDataOption::class, 'maintenance_type_option_id');
    }

    public function status(): BelongsTo
    {
        return $this->belongsTo(MasterDataOption::class, 'status_option_id');
    }

    public function completedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'completed_by');
    }
}
