<?php

namespace App\Models;

use Database\Factories\InventoryLogFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryLog extends Model
{
    /** @use HasFactory<InventoryLogFactory> */
    use HasFactory;

    public const TYPE_IN = 'in';

    public const TYPE_OUT = 'out';

    public const TYPE_TRANSFER_IN = 'transfer_in';

    public const TYPE_TRANSFER_OUT = 'transfer_out';

    public const TYPE_OPNAME = 'opname';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'kitchen_inventory_id',
        'type',
        'condition_option_id',
        'quantity_change',
        'stock_before',
        'stock_after',
        'transfer_group_id',
        'related_kitchen_id',
        'performed_by',
        'note',
    ];

    public function kitchenInventory(): BelongsTo
    {
        return $this->belongsTo(KitchenInventory::class);
    }

    public function condition(): BelongsTo
    {
        return $this->belongsTo(MasterDataOption::class, 'condition_option_id');
    }

    public function relatedKitchen(): BelongsTo
    {
        return $this->belongsTo(Kitchen::class, 'related_kitchen_id');
    }

    public function performedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by');
    }
}
