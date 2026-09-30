<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\InventoryLog;
use App\Models\Kitchen;
use App\Models\KitchenTool;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InventoryLogController extends Controller
{
    public function index(Request $request): Response
    {
        $logs = InventoryLog::query()
            ->with(['kitchenInventory.kitchen', 'kitchenInventory.kitchenTool', 'condition', 'relatedKitchen', 'performedBy'])
            ->when($request->integer('kitchen_id'), function ($query, $kitchenId) {
                $query->whereHas('kitchenInventory', fn ($q) => $q->where('kitchen_id', $kitchenId));
            })
            ->when($request->integer('kitchen_tool_id'), function ($query, $kitchenToolId) {
                $query->whereHas('kitchenInventory', fn ($q) => $q->where('kitchen_tool_id', $kitchenToolId));
            })
            ->when($request->string('type')->toString(), fn ($query, $type) => $query->where('type', $type))
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate(25)
            ->withQueryString();

        return Inertia::render('inventory/logs', [
            'logs' => $logs,
            'kitchens' => Kitchen::query()->orderBy('name')->get(['id', 'name']),
            'kitchenTools' => KitchenTool::query()->orderBy('name')->get(['id', 'name']),
            'filters' => $request->only(['kitchen_id', 'kitchen_tool_id', 'type']),
        ]);
    }
}
