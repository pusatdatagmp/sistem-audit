<?php

namespace App\Observers;

use App\Models\EquipmentRequest;
use App\Services\Notifications\FonnteWhatsappService;

class EquipmentRequestObserver
{
    public function __construct(private FonnteWhatsappService $whatsapp) {}

    public function created(EquipmentRequest $request): void
    {
        $request->loadMissing(['requestedBy', 'kitchen', 'kitchenTool']);

        $toolName = $request->kitchenTool?->name ?? $request->new_tool_name ?? '-';

        $message = "Permintaan equipment baru\n".
            'Kitchen: '.($request->kitchen?->name ?? '-')."\n".
            'Diajukan oleh: '.($request->requestedBy?->name ?? '-')."\n".
            "Alat: {$toolName} (qty: {$request->quantity})";

        $this->whatsapp->sendToAdmin($message);
    }
}
