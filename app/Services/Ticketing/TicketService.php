<?php

namespace App\Services\Ticketing;

use App\Models\ComplaintTicket;
use App\Models\ComplaintTicketUpdate;
use App\Models\MasterDataOption;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Support\Facades\DB;

class TicketService
{
    private const VEHICLE_ISSUE_CATEGORY_CODE = 'kendala-kendaraan';

    private const VEHICLE_STATUS_IN_REPAIR_CODE = 'dalam-perbaikan';

    private const VEHICLE_STATUS_ACTIVE_CODE = 'aktif';

    /**
     * @param  array<string, mixed>  $data
     */
    public function createTicket(array $data, User $reporter): ComplaintTicket
    {
        $photo = $data['photo'] ?? null;
        unset($data['photo']);

        return DB::transaction(function () use ($data, $reporter, $photo) {
            $ticket = ComplaintTicket::create([
                ...$data,
                'reporter_id' => $reporter->id,
                'status' => ComplaintTicket::STATUS_OPEN,
                'photo_path' => $photo?->store('tickets', 'public'),
            ]);

            $this->syncVehicleStatus($ticket->fresh(['category']));

            return $ticket;
        });
    }

    public function changeStatus(
        ComplaintTicket $ticket,
        string $newStatus,
        User $actor,
        ?int $assignedTo = null,
        ?string $note = null,
    ): ComplaintTicketUpdate {
        return DB::transaction(function () use ($ticket, $newStatus, $actor, $assignedTo, $note) {
            $locked = ComplaintTicket::whereKey($ticket->id)->lockForUpdate()->firstOrFail();
            $previousStatus = $locked->status;

            $locked->update([
                'status' => $newStatus,
                'assigned_to' => $assignedTo ?? $locked->assigned_to,
                'resolved_at' => $newStatus === ComplaintTicket::STATUS_RESOLVED ? now() : null,
            ]);

            $this->syncVehicleStatus($locked->fresh(['category']));

            return $locked->updates()->create([
                'user_id' => $actor->id,
                'status_from' => $previousStatus,
                'status_to' => $newStatus,
                'note' => $note,
            ]);
        });
    }

    /**
     * Keep the related vehicle's status in sync with its complaint tickets: mark it
     * "Dalam Perbaikan" while a vehicle-issue ticket is open/in progress, and revert
     * it to "Aktif" once resolved — but only if nothing else still needs attention
     * and only if the status wasn't since changed away from "Dalam Perbaikan" by
     * someone else (so we never clobber a deliberate manual status change).
     */
    private function syncVehicleStatus(ComplaintTicket $ticket): void
    {
        if (! $ticket->related_vehicle_id || $ticket->category?->code !== self::VEHICLE_ISSUE_CATEGORY_CODE) {
            return;
        }

        $vehicle = Vehicle::find($ticket->related_vehicle_id);

        if (! $vehicle) {
            return;
        }

        if ($ticket->status === ComplaintTicket::STATUS_RESOLVED) {
            $this->revertVehicleToActiveIfClear($vehicle, $ticket->id);
        } else {
            $this->markVehicleInRepair($vehicle);
        }
    }

    private function markVehicleInRepair(Vehicle $vehicle): void
    {
        $inRepair = MasterDataOption::ofGroup('vehicle_status')->where('code', self::VEHICLE_STATUS_IN_REPAIR_CODE)->first();

        if ($inRepair && $vehicle->status_option_id !== $inRepair->id) {
            $vehicle->update(['status_option_id' => $inRepair->id]);
        }
    }

    private function revertVehicleToActiveIfClear(Vehicle $vehicle, int $excludingTicketId): void
    {
        $inRepair = MasterDataOption::ofGroup('vehicle_status')->where('code', self::VEHICLE_STATUS_IN_REPAIR_CODE)->first();
        $active = MasterDataOption::ofGroup('vehicle_status')->where('code', self::VEHICLE_STATUS_ACTIVE_CODE)->first();

        if (! $inRepair || ! $active || $vehicle->status_option_id !== $inRepair->id) {
            return;
        }

        $hasOtherOpenVehicleTickets = ComplaintTicket::query()
            ->where('related_vehicle_id', $vehicle->id)
            ->where('id', '!=', $excludingTicketId)
            ->whereIn('status', [ComplaintTicket::STATUS_OPEN, ComplaintTicket::STATUS_IN_PROGRESS])
            ->exists();

        if (! $hasOtherOpenVehicleTickets) {
            $vehicle->update(['status_option_id' => $active->id]);
        }
    }
}
