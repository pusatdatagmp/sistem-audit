<?php

namespace App\Models;

use Database\Factories\MasterDataGroupFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MasterDataGroup extends Model
{
    /** @use HasFactory<MasterDataGroupFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'code',
        'name',
        'description',
        'is_locked',
    ];

    protected function casts(): array
    {
        return [
            'is_locked' => 'boolean',
        ];
    }

    public function options(): HasMany
    {
        return $this->hasMany(MasterDataOption::class);
    }
}
