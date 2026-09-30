<?php

namespace App\Models;

use Database\Factories\ComplaintTicketFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

class ComplaintTicket extends Model
{
    /** @use HasFactory<ComplaintTicketFactory> */
    use HasFactory;

    public const STATUS_OPEN = 'open';

    public const STATUS_IN_PROGRESS = 'in_progress';

    public const STATUS_RESOLVED = 'resolved';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'ticket_number',
        'reporter_id',
        'kitchen_id',
        'category_option_id',
        'priority_option_id',
        'status',
        'related_kitchen_tool_id',
        'related_vehicle_id',
        'subject',
        'description',
        'photo_path',
        'assigned_to',
        'resolved_at',
    ];

    /**
     * @var list<string>
     */
    protected $appends = ['photo_url'];

    protected function casts(): array
    {
        return [
            'resolved_at' => 'datetime',
        ];
    }

    protected function photoUrl(): Attribute
    {
        return Attribute::get(fn () => $this->photo_path ? Storage::disk('public')->url($this->photo_path) : null);
    }

    protected static function booted(): void
    {
        static::creating(function (self $ticket): void {
            if (empty($ticket->ticket_number)) {
                $ticket->ticket_number = static::generateTicketNumber();
            }
        });
    }

    protected static function generateTicketNumber(): string
    {
        $prefix = 'TCK-'.now()->format('Ymd').'-';

        $sequence = static::query()
            ->where('ticket_number', 'like', $prefix.'%')
            ->count() + 1;

        return $prefix.str_pad((string) $sequence, 4, '0', STR_PAD_LEFT);
    }

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    public function kitchen(): BelongsTo
    {
        return $this->belongsTo(Kitchen::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(MasterDataOption::class, 'category_option_id');
    }

    public function priority(): BelongsTo
    {
        return $this->belongsTo(MasterDataOption::class, 'priority_option_id');
    }

    public function relatedKitchenTool(): BelongsTo
    {
        return $this->belongsTo(KitchenTool::class, 'related_kitchen_tool_id');
    }

    public function relatedVehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class, 'related_vehicle_id');
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function updates(): HasMany
    {
        return $this->hasMany(ComplaintTicketUpdate::class);
    }
}
