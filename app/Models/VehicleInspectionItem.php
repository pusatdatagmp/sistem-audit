<?php

namespace App\Models;

use Database\Factories\VehicleInspectionItemFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VehicleInspectionItem extends Model
{
    /** @use HasFactory<VehicleInspectionItemFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'vehicle_inspection_id',
        'component_option_id',
        'condition_option_id',
        'notes',
    ];

    public function inspection(): BelongsTo
    {
        return $this->belongsTo(VehicleInspection::class, 'vehicle_inspection_id');
    }

    public function component(): BelongsTo
    {
        return $this->belongsTo(MasterDataOption::class, 'component_option_id');
    }

    public function condition(): BelongsTo
    {
        return $this->belongsTo(MasterDataOption::class, 'condition_option_id');
    }
}
