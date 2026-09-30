<?php

namespace App\Models;

use Database\Factories\KitchenFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Kitchen extends Model
{
    /** @use HasFactory<KitchenFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'code',
        'name',
        'address',
        'pic_name',
        'phone',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function inventories(): HasMany
    {
        return $this->hasMany(KitchenInventory::class);
    }

    public function vehicles(): HasMany
    {
        return $this->hasMany(Vehicle::class, 'home_kitchen_id');
    }

    public function usageLogs(): HasMany
    {
        return $this->hasMany(VehicleUsageLog::class);
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(ComplaintTicket::class);
    }
}
