<?php

namespace App\Observers;

use App\Models\ComplaintTicket;
use App\Services\Notifications\FonnteWhatsappService;

class ComplaintTicketObserver
{
    public function __construct(private FonnteWhatsappService $whatsapp) {}

    public function created(ComplaintTicket $ticket): void
    {
        $ticket->loadMissing(['reporter', 'kitchen']);

        $message = "Tiket komplain baru *{$ticket->ticket_number}*\n".
            'Kitchen: '.($ticket->kitchen?->name ?? '-')."\n".
            'Pelapor: '.($ticket->reporter?->name ?? '-')."\n".
            "Subjek: {$ticket->subject}";

        $this->whatsapp->sendToAdmin($message);
    }
}
