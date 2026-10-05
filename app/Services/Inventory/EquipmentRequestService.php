<?php

namespace App\Services\Inventory;

use App\Models\EquipmentRequest;
use App\Models\KitchenInventory;
use App\Models\KitchenTool;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class EquipmentRequestService
{
    public function __construct(private readonly StockMutationService $stockMutationService) {}

    public function approve(EquipmentRequest $request, User $approver, ?string $note = null): EquipmentRequest
    {
        return DB::transaction(function () use ($request, $approver, $note) {
            $locked = $this->lockPending($request);

            $tool = $locked->kitchen_tool_id
                ? KitchenTool::findOrFail($locked->kitchen_tool_id)
                : $this->createToolFromRequest($locked);

            $inventory = KitchenInventory::firstOrCreate(
                ['kitchen_id' => $locked->kitchen_id, 'kitchen_tool_id' => $tool->id],
                ['quantity_good' => 0, 'quantity_needs_repair' => 0, 'quantity_damaged' => 0],
            );

            $this->stockMutationService->stockIn(
                $inventory,
                $locked->quantity,
                'baik',
                $approver,
                "Disetujui dari pengajuan #{$locked->id}".($note ? ": {$note}" : ''),
            );

            $locked->update([
                'kitchen_tool_id' => $tool->id,
                'status' => EquipmentRequest::STATUS_APPROVED,
                'reviewed_by' => $approver->id,
                'reviewed_at' => now(),
                'review_note' => $note,
            ]);

            return $locked->fresh();
        });
    }

    public function reject(EquipmentRequest $request, User $approver, string $note): EquipmentRequest
    {
        return DB::transaction(function () use ($request, $approver, $note) {
            $locked = $this->lockPending($request);

            $locked->update([
                'status' => EquipmentRequest::STATUS_REJECTED,
                'reviewed_by' => $approver->id,
                'reviewed_at' => now(),
                'review_note' => $note,
            ]);

            return $locked->fresh();
        });
    }

    private function lockPending(EquipmentRequest $request): EquipmentRequest
    {
        $locked = EquipmentRequest::whereKey($request->id)->lockForUpdate()->firstOrFail();

        if (! $locked->isPending()) {
            throw ValidationException::withMessages(['status' => 'Pengajuan ini sudah diproses sebelumnya.']);
        }

        return $locked;
    }

    private function createToolFromRequest(EquipmentRequest $request): KitchenTool
    {
        return KitchenTool::create([
            'code' => $this->uniqueToolCode($request->new_tool_name),
            'name' => $request->new_tool_name,
            'unit' => $request->new_tool_unit,
            'category_option_id' => $request->new_tool_category_option_id,
            'is_active' => true,
        ]);
    }

    private function uniqueToolCode(string $name): string
    {
        $base = Str::slug($name) ?: 'alat';
        $code = $base;
        $suffix = 2;

        while (KitchenTool::query()->where('code', $code)->exists()) {
            $code = "{$base}-{$suffix}";
            $suffix++;
        }

        return $code;
    }
}
