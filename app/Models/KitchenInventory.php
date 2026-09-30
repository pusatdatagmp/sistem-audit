<?php

namespace App\Models;

use Database\Factories\KitchenInventoryFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KitchenInventory extends Model
{
    /** @use HasFactory<KitchenInventoryFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'kitchen_id',
        'kitchen_tool_id',
        'quantity_good',
        'quantity_needs_repair',
        'quantity_damaged',
    ];

    public function kitchen(): BelongsTo
    {
        return $this->belongsTo(Kitchen::class);
    }

    public function kitchenTool(): BelongsTo
    {
        return $this->belongsTo(KitchenTool::class);
    }

    public function logs(): HasMany
    {
        return $this->hasMany(InventoryLog::class);
    }

    public function totalQuantity(): int
    {
        return $this->quantity_good + $this->quantity_needs_repair + $this->quantity_damaged;
    }
}
