<?php

namespace App\Models;

use Database\Factories\EquipmentRequestFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EquipmentRequest extends Model
{
    /** @use HasFactory<EquipmentRequestFactory> */
    use HasFactory;

    public const STATUS_PENDING = 'pending';

    public const STATUS_APPROVED = 'approved';

    public const STATUS_REJECTED = 'rejected';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'requested_by',
        'kitchen_id',
        'kitchen_tool_id',
        'new_tool_name',
        'new_tool_unit',
        'new_tool_category_option_id',
        'quantity',
        'reason',
        'status',
        'reviewed_by',
        'review_note',
        'reviewed_at',
    ];

    protected function casts(): array
    {
        return [
            'reviewed_at' => 'datetime',
        ];
    }

    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function kitchen(): BelongsTo
    {
        return $this->belongsTo(Kitchen::class);
    }

    public function kitchenTool(): BelongsTo
    {
        return $this->belongsTo(KitchenTool::class);
    }

    public function newToolCategory(): BelongsTo
    {
        return $this->belongsTo(MasterDataOption::class, 'new_tool_category_option_id');
    }

    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }
}
