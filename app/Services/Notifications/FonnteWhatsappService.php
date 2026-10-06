<?php

namespace App\Services\Notifications;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FonnteWhatsappService
{
    public function sendToAdmin(string $message): void
    {
        $target = config('services.fonnte.admin_number');

        if (filled($target)) {
            $this->send($target, $message);
        }
    }

    public function send(string $target, string $message): bool
    {
        $token = config('services.fonnte.token');

        if (blank($token)) {
            Log::warning('Fonnte WhatsApp notification skipped: FONNTE_TOKEN is not configured.');

            return false;
        }

        try {
            $response = Http::asForm()
                ->withHeaders(['Authorization' => $token])
                ->timeout(10)
                ->post(config('services.fonnte.url'), [
                    'target' => $target,
                    'message' => $message,
                ]);

            if ($response->failed()) {
                Log::warning('Fonnte WhatsApp notification failed.', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return false;
            }

            return true;
        } catch (\Throwable $e) {
            Log::warning('Fonnte WhatsApp notification threw an exception: '.$e->getMessage());

            return false;
        }
    }
}
