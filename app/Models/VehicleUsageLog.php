<?php

namespace App\Models;

use Database\Factories\VehicleUsageLogFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VehicleUsageLog extends Model
{
    /** @use HasFactory<VehicleUsageLogFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'vehicle_id',
        'driver_id',
        'kitchen_id',
        'usage_date',
        'start_odometer',
        'end_odometer',
        'destination',
        'purpose',
    ];

    protected function casts(): array
    {
        return [
            'usage_date' => 'date',
        ];
    }

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'driver_id');
    }

    public function kitchen(): BelongsTo
    {
        return $this->belongsTo(Kitchen::class);
    }
}
