<?php

namespace App\Exceptions;

use App\Models\KitchenInventory;
use Exception;

class InsufficientStockException extends Exception
{
    public static function forCondition(KitchenInventory $inventory, string $condition, int $requested, int $available): self
    {
        return new self(
            "Stok tidak cukup untuk kondisi \"{$condition}\" pada alat #{$inventory->kitchen_tool_id} di dapur #{$inventory->kitchen_id}: diminta {$requested}, tersedia {$available}."
        );
    }
}
