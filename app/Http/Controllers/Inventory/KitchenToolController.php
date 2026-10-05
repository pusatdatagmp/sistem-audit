<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Concerns\SortsQuery;
use App\Http\Controllers\Controller;
use App\Http\Requests\Inventory\StoreKitchenToolRequest;
use App\Http\Requests\Inventory\UpdateKitchenToolRequest;
use App\Models\KitchenTool;
use App\Models\MasterDataOption;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KitchenToolController extends Controller
{
    use SortsQuery;

    public function index(Request $request): Response
    {
        $sortable = [
            'code' => 'kitchen_tools.code',
            'name' => 'kitchen_tools.name',
            'unit' => 'kitchen_tools.unit',
            'category' => fn () => MasterDataOption::query()->select('label')->whereColumn('id', 'kitchen_tools.category_option_id'),
        ];

        $query = KitchenTool::query()
            ->with('category')
            ->when($request->integer('category_option_id'), function ($query, $categoryOptionId) {
                $query->where('category_option_id', $categoryOptionId);
            })
            ->when($request->has('is_active'), function ($query) use ($request) {
                $query->where('is_active', $request->boolean('is_active'));
            })
            ->when($request->string('search')->toString(), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%");
                });
            });

        $sortState = $this->applySort($query, $request, $sortable, fn ($q) => $q->orderBy('kitchen_tools.name'));

        $kitchenTools = $query->paginate(20)->withQueryString();

        return Inertia::render('inventory/kitchen-tools/index', [
            'kitchenTools' => $kitchenTools,
            'categoryOptions' => MasterDataOption::ofGroup('kitchen_tool_category')->active()->orderBy('sort_order')->get(['id', 'code', 'label']),
            'filters' => [
                ...$request->only(['category_option_id', 'is_active', 'search']),
                ...$sortState,
            ],
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
