<?php

namespace App\Models;

use Database\Factories\MasterDataOptionFactory;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MasterDataOption extends Model
{
    /** @use HasFactory<MasterDataOptionFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'master_data_group_id',
        'code',
        'label',
        'description',
        'sort_order',
        'is_active',
        'meta',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'meta' => 'array',
        ];
    }

    public function group(): BelongsTo
    {
        return $this->belongsTo(MasterDataGroup::class, 'master_data_group_id');
    }

    #[Scope]
    protected function active(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    #[Scope]
    protected function ofGroup(Builder $query, string $groupCode): Builder
    {
        return $query->whereHas('group', fn (Builder $q) => $q->where('code', $groupCode));
    }
}
