<?php

namespace App\Models;

use Database\Factories\VehicleInspectionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VehicleInspection extends Model
{
    /** @use HasFactory<VehicleInspectionFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'vehicle_id',
        'inspected_by',
        'inspected_at',
        'odometer',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'inspected_at' => 'datetime',
        ];
    }

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function inspectedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'inspected_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(VehicleInspectionItem::class);
    }
}
