<?php

namespace App\Models;

use Database\Factories\KitchenToolFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KitchenTool extends Model
{
    /** @use HasFactory<KitchenToolFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'code',
        'name',
        'unit',
        'category_option_id',
        'description',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(MasterDataOption::class, 'category_option_id');
    }

    public function inventories(): HasMany
    {
        return $this->hasMany(KitchenInventory::class);
    }
}
