<?php

namespace App\Services\Inventory;

use App\Exceptions\InsufficientStockException;
use App\Models\InventoryLog;
use App\Models\Kitchen;
use App\Models\KitchenInventory;
use App\Models\KitchenTool;
use App\Models\MasterDataOption;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class StockMutationService
{
    /**
     * @var array<string, string>
     */
    private const CONDITION_COLUMNS = [
        'baik' => 'quantity_good',
        'perlu-perbaikan' => 'quantity_needs_repair',
        'rusak-berat' => 'quantity_damaged',
    ];

    public function stockIn(KitchenInventory $inventory, int $quantity, string $conditionCode, User $actor, ?string $note = null): InventoryLog
    {
        return DB::transaction(function () use ($inventory, $quantity, $conditionCode, $actor, $note) {
            $locked = KitchenInventory::whereKey($inventory->id)->lockForUpdate()->firstOrFail();
            $column = $this->columnForCondition($conditionCode);

            $before = $locked->{$column};
            $locked->{$column} = $before + $quantity;
            $locked->save();

            return $this->writeLog(
                $locked, InventoryLog::TYPE_IN, $conditionCode, $quantity, $before, $locked->{$column}, $actor, $note,
            );
        });
    }

    public function stockOut(KitchenInventory $inventory, int $quantity, string $conditionCode, User $actor, ?string $note = null): InventoryLog
    {
        return DB::transaction(function () use ($inventory, $quantity, $conditionCode, $actor, $note) {
            $locked = KitchenInventory::whereKey($inventory->id)->lockForUpdate()->firstOrFail();
            $column = $this->columnForCondition($conditionCode);

            $before = $locked->{$column};

            if ($before < $quantity) {
                throw InsufficientStockException::forCondition($locked, $conditionCode, $quantity, $before);
            }

            $locked->{$column} = $before - $quantity;
            $locked->save();

            return $this->writeLog(
                $locked, InventoryLog::TYPE_OUT, $conditionCode, -$quantity, $before, $locked->{$column}, $actor, $note,
            );
        });
    }

    /**
     * @return array{0: InventoryLog, 1: InventoryLog}
     */
    public function transfer(Kitchen $from, Kitchen $to, KitchenTool $tool, int $quantity, string $conditionCode, User $actor, ?string $note = null): array
    {
        return DB::transaction(function () use ($from, $to, $tool, $quantity, $conditionCode, $actor, $note) {
            $column = $this->columnForCondition($conditionCode);

            $source = KitchenInventory::where('kitchen_id', $from->id)
                ->where('kitchen_tool_id', $tool->id)
                ->lockForUpdate()
                ->firstOrFail();

            $sourceBefore = $source->{$column};

            if ($sourceBefore < $quantity) {
                throw InsufficientStockException::forCondition($source, $conditionCode, $quantity, $sourceBefore);
            }

            $source->{$column} = $sourceBefore - $quantity;
            $source->save();

            $destination = KitchenInventory::where('kitchen_id', $to->id)
                ->where('kitchen_tool_id', $tool->id)
                ->lockForUpdate()
                ->first();

            if (! $destination) {
                $destination = KitchenInventory::create([
                    'kitchen_id' => $to->id,
                    'kitchen_tool_id' => $tool->id,
                    'quantity_good' => 0,
                    'quantity_needs_repair' => 0,
                    'quantity_damaged' => 0,
                ]);
            }

            $destinationBefore = $destination->{$column};
            $destination->{$column} = $destinationBefore + $quantity;
            $destination->save();

            $transferGroupId = (string) Str::uuid();

            $outLog = $this->writeLog(
                $source, InventoryLog::TYPE_TRANSFER_OUT, $conditionCode, -$quantity,
                $sourceBefore, $source->{$column}, $actor, $note, $transferGroupId, $to->id,
            );

            $inLog = $this->writeLog(
                $destination, InventoryLog::TYPE_TRANSFER_IN, $conditionCode, $quantity,
                $destinationBefore, $destination->{$column}, $actor, $note, $transferGroupId, $from->id,
            );

            return [$outLog, $inLog];
        });
    }

    /**
     * @param  array<string, int>  $counted  Condition code => counted quantity.
     * @return list<InventoryLog>
     */
    public function opname(KitchenInventory $inventory, array $counted, User $actor, ?string $note = null): array
    {
        return DB::transaction(function () use ($inventory, $counted, $actor, $note) {
            $locked = KitchenInventory::whereKey($inventory->id)->lockForUpdate()->firstOrFail();
            $logs = [];

            foreach ($counted as $conditionCode => $countedQuantity) {
                $column = $this->columnForCondition($conditionCode);
                $before = $locked->{$column};
                $delta = $countedQuantity - $before;

                if ($delta === 0) {
                    continue;
                }

                $locked->{$column} = $countedQuantity;
                $logs[] = $this->writeLog(
                    $locked, InventoryLog::TYPE_OPNAME, $conditionCode, $delta, $before, $countedQuantity, $actor, $note,
                );
            }

            $locked->save();

            return $logs;
        });
    }

    private function writeLog(
        KitchenInventory $inventory,
        string $type,
        string $conditionCode,
        int $quantityChange,
        int $stockBefore,
        int $stockAfter,
        User $actor,
        ?string $note,
        ?string $transferGroupId = null,
        ?int $relatedKitchenId = null,
    ): InventoryLog {
        return $inventory->logs()->create([
            'type' => $type,
            'condition_option_id' => $this->resolveConditionOption($conditionCode)->id,
            'quantity_change' => $quantityChange,
            'stock_before' => $stockBefore,
            'stock_after' => $stockAfter,
            'transfer_group_id' => $transferGroupId,
            'related_kitchen_id' => $relatedKitchenId,
            'performed_by' => $actor->id,
            'note' => $note,
        ]);
    }

    private function columnForCondition(string $conditionCode): string
    {
        return self::CONDITION_COLUMNS[$conditionCode]
            ?? throw new \InvalidArgumentException("Kode kondisi \"{$conditionCode}\" tidak dikenali.");
    }

    private function resolveConditionOption(string $conditionCode): MasterDataOption
    {
        return MasterDataOption::ofGroup('physical_condition')
            ->where('code', $conditionCode)
            ->firstOrFail();
    }
}
