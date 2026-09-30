<?php

namespace App\Models;

use Database\Factories\ComplaintTicketUpdateFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ComplaintTicketUpdate extends Model
{
    /** @use HasFactory<ComplaintTicketUpdateFactory> */
    use HasFactory;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'complaint_ticket_id',
        'user_id',
        'status_from',
        'status_to',
        'note',
    ];

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(ComplaintTicket::class, 'complaint_ticket_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
