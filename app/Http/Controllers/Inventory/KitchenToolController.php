<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Http\Requests\Inventory\StoreKitchenToolRequest;
use App\Http\Requests\Inventory\UpdateKitchenToolRequest;
use App\Models\KitchenTool;
use App\Models\MasterDataOption;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class KitchenToolController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('inventory/kitchen-tools/index', [
            'kitchenTools' => KitchenTool::query()
                ->with('category')
                ->orderBy('name')
                ->paginate(20),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('inventory/kitchen-tools/create', [
            'categoryOptions' => MasterDataOption::ofGroup('kitchen_tool_category')->active()->orderBy('sort_order')->get(['id', 'code', 'label']),
        ]);
    }

    public function store(StoreKitchenToolRequest $request): RedirectResponse
    {
        KitchenTool::create($request->validated());

        return to_route('inventory.kitchen-tools.index')->with('success', 'Alat dapur berhasil ditambahkan.');
    }

    public function edit(KitchenTool $kitchenTool): Response
    {
        return Inertia::render('inventory/kitchen-tools/edit', [
            'kitchenTool' => $kitchenTool,
            'categoryOptions' => MasterDataOption::ofGroup('kitchen_tool_category')->active()->orderBy('sort_order')->get(['id', 'code', 'label']),
        ]);
    }

    public function update(UpdateKitchenToolRequest $request, KitchenTool $kitchenTool): RedirectResponse
    {
        $kitchenTool->update($request->validated());

        return to_route('inventory.kitchen-tools.index')->with('success', 'Alat dapur berhasil diperbarui.');
    }

    public function destroy(KitchenTool $kitchenTool): RedirectResponse
    {
        try {
            $kitchenTool->delete();
        } catch (QueryException) {
            return back()->withErrors(['kitchen_tool' => 'Alat dapur tidak bisa dihapus karena masih memiliki riwayat stok/tiket. Nonaktifkan saja alat ini.']);
        }

        return to_route('inventory.kitchen-tools.index')->with('success', 'Alat dapur berhasil dihapus.');
    }
}
