<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Concerns\SortsQuery;
use App\Http\Controllers\Controller;
use App\Models\InventoryLog;
use App\Models\Kitchen;
use App\Models\KitchenInventory;
use App\Models\KitchenTool;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InventoryLogController extends Controller
{
    use SortsQuery;

    public function index(Request $request): Response
    {
        $query = InventoryLog::query()
            ->with(['kitchenInventory.kitchen', 'kitchenInventory.kitchenTool', 'condition', 'relatedKitchen', 'performedBy'])
            ->when($request->integer('kitchen_id'), function ($query, $kitchenId) {
                $query->whereHas('kitchenInventory', fn ($q) => $q->where('kitchen_id', $kitchenId));
            })
            ->when($request->integer('kitchen_tool_id'), function ($query, $kitchenToolId) {
                $query->whereHas('kitchenInventory', fn ($q) => $q->where('kitchen_tool_id', $kitchenToolId));
            })
            ->when($request->string('type')->toString(), fn ($query, $type) => $query->where('type', $type));

        $sortable = [
            'created_at' => 'inventory_logs.created_at',
            'kitchen' => fn () => KitchenInventory::query()
                ->join('kitchens', 'kitchens.id', '=', 'kitchen_inventories.kitchen_id')
                ->select('kitchens.name')
                ->whereColumn('kitchen_inventories.id', 'inventory_logs.kitchen_inventory_id'),
            'tool' => fn () => KitchenInventory::query()
                ->join('kitchen_tools', 'kitchen_tools.id', '=', 'kitchen_inventories.kitchen_tool_id')
                ->select('kitchen_tools.name')
                ->whereColumn('kitchen_inventories.id', 'inventory_logs.kitchen_inventory_id'),
            'quantity_change' => 'inventory_logs.quantity_change',
            'stock_after' => 'inventory_logs.stock_after',
            'performed_by' => fn () => User::query()->select('name')->whereColumn('id', 'inventory_logs.performed_by'),
        ];

        $sortState = $this->applySort(
            $query,
            $request,
            $sortable,
            fn ($q) => $q->orderByDesc('inventory_logs.created_at')->orderByDesc('inventory_logs.id'),
        );

        $logs = $query->paginate(25)->withQueryString();

        return Inertia::render('inventory/logs', [
            'logs' => $logs,
            'kitchens' => Kitchen::query()->orderBy('name')->get(['id', 'name']),
            'kitchenTools' => KitchenTool::query()->orderBy('name')->get(['id', 'name']),
            'filters' => [
                ...$request->only(['kitchen_id', 'kitchen_tool_id', 'type']),
                ...$sortState,
            ],
        ]);
    }
}
