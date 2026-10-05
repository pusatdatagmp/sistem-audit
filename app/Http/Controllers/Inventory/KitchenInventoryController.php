<?php

namespace App\Http\Controllers\Inventory;

use App\Exceptions\InsufficientStockException;
use App\Http\Controllers\Concerns\SortsQuery;
use App\Http\Controllers\Controller;
use App\Http\Requests\Inventory\StockInRequest;
use App\Http\Requests\Inventory\StockOpnameRequest;
use App\Http\Requests\Inventory\StockOutRequest;
use App\Http\Requests\Inventory\TransferStockRequest;
use App\Models\Kitchen;
use App\Models\KitchenInventory;
use App\Models\KitchenTool;
use App\Models\MasterDataOption;
use App\Services\Inventory\StockMutationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KitchenInventoryController extends Controller
{
    use SortsQuery;

    public function __construct(private readonly StockMutationService $stockMutationService) {}

    /**
     * @var array<string, string>
     */
    private const SORTABLE = [
        'kitchen' => 'kitchens.name',
        'tool' => 'kitchen_tools.name',
        'good' => 'kitchen_inventories.quantity_good',
        'needs_repair' => 'kitchen_inventories.quantity_needs_repair',
        'damaged' => 'kitchen_inventories.quantity_damaged',
        'total' => 'total_quantity',
    ];

    public function index(Request $request): Response
    {
        $query = KitchenInventory::query()
            ->select('kitchen_inventories.*')
            ->selectRaw('(quantity_good + quantity_needs_repair + quantity_damaged) as total_quantity')
            ->join('kitchens', 'kitchens.id', '=', 'kitchen_inventories.kitchen_id')
            ->join('kitchen_tools', 'kitchen_tools.id', '=', 'kitchen_inventories.kitchen_tool_id')
            ->with(['kitchen', 'kitchenTool.category'])
            ->when($request->integer('kitchen_id'), fn ($query, $kitchenId) => $query->where('kitchen_inventories.kitchen_id', $kitchenId))
            ->when($request->integer('category_option_id'), function ($query, $categoryOptionId) {
                $query->where('kitchen_tools.category_option_id', $categoryOptionId);
            })
            ->when($request->string('search')->toString(), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('kitchen_tools.name', 'like', "%{$search}%")
                        ->orWhere('kitchen_tools.code', 'like', "%{$search}%")
                        ->orWhere('kitchens.name', 'like', "%{$search}%");
                });
            });

        $sortState = $this->applySort($query, $request, self::SORTABLE, fn ($q) => $q->orderBy('kitchens.name'));

        $inventories = $query
            ->orderBy('kitchen_inventories.id')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('inventory/index', [
            'inventories' => $inventories,
            'kitchens' => Kitchen::query()->where('is_active', true)->orderBy('name')->get(['id', 'name', 'code']),
            'kitchenTools' => KitchenTool::query()->where('is_active', true)->orderBy('name')->get(['id', 'name', 'code', 'unit']),
            'categoryOptions' => MasterDataOption::ofGroup('kitchen_tool_category')->active()->orderBy('sort_order')->get(['id', 'code', 'label']),
            'conditionOptions' => MasterDataOption::ofGroup('physical_condition')->active()->orderBy('sort_order')->get(['id', 'code', 'label']),
            'filters' => [
                ...$request->only(['kitchen_id', 'category_option_id', 'search']),
                ...$sortState,
            ],
        ]);
    }

    public function stockIn(StockInRequest $request): RedirectResponse
    {
        $inventory = KitchenInventory::findOrFail($request->integer('kitchen_inventory_id'));

        $this->stockMutationService->stockIn(
            $inventory,
            $request->integer('quantity'),
            $request->string('condition_code')->toString(),
            $request->user(),
            $request->input('note'),
        );

        return back()->with('success', 'Stok berhasil ditambahkan.');
    }

    public function stockOut(StockOutRequest $request): RedirectResponse
    {
        $inventory = KitchenInventory::findOrFail($request->integer('kitchen_inventory_id'));

        try {
            $this->stockMutationService->stockOut(
                $inventory,
                $request->integer('quantity'),
                $request->string('condition_code')->toString(),
                $request->user(),
                $request->input('note'),
            );
        } catch (InsufficientStockException $exception) {
            return back()->withErrors(['quantity' => $exception->getMessage()]);
        }

        return back()->with('success', 'Stok berhasil dikurangi.');
    }

    public function transfer(TransferStockRequest $request): RedirectResponse
    {
        $from = Kitchen::findOrFail($request->integer('from_kitchen_id'));
        $to = Kitchen::findOrFail($request->integer('to_kitchen_id'));
        $tool = KitchenTool::findOrFail($request->integer('kitchen_tool_id'));

        try {
            $this->stockMutationService->transfer(
                $from,
                $to,
                $tool,
                $request->integer('quantity'),
                $request->string('condition_code')->toString(),
                $request->user(),
                $request->input('note'),
            );
        } catch (InsufficientStockException $exception) {
            return back()->withErrors(['quantity' => $exception->getMessage()]);
        }

        return back()->with('success', 'Transfer stok berhasil.');
    }

    public function opname(StockOpnameRequest $request): RedirectResponse
    {
        $inventory = KitchenInventory::findOrFail($request->integer('kitchen_inventory_id'));

        $this->stockMutationService->opname(
            $inventory,
            $request->array('counted'),
            $request->user(),
            $request->input('note'),
        );

        return back()->with('success', 'Stock opname berhasil dicatat.');
    }
}
