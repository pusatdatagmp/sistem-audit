<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Concerns\SortsQuery;
use App\Http\Controllers\Controller;
use App\Http\Requests\MasterData\StoreKitchenRequest;
use App\Http\Requests\MasterData\UpdateKitchenRequest;
use App\Models\Kitchen;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KitchenController extends Controller
{
    use SortsQuery;

    /**
     * @var array<string, string>
     */
    private const SORTABLE = [
        'code' => 'code',
        'name' => 'name',
        'pic_name' => 'pic_name',
        'phone' => 'phone',
    ];

    public function index(Request $request): Response
    {
        $query = Kitchen::query()
            ->when($request->has('is_active'), fn ($q) => $q->where('is_active', $request->boolean('is_active')))
            ->when($request->string('search')->toString(), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%")
                        ->orWhere('pic_name', 'like', "%{$search}%");
                });
            });

        $sortState = $this->applySort($query, $request, self::SORTABLE, fn ($q) => $q->orderBy('name'));

        return Inertia::render('master-data/kitchens/index', [
            'kitchens' => $query->paginate(20)->withQueryString(),
            'filters' => [
                ...$request->only(['is_active', 'search']),
                ...$sortState,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('master-data/kitchens/create');
    }

    public function store(StoreKitchenRequest $request): RedirectResponse
    {
        Kitchen::create($request->validated());

        return to_route('master-data.kitchens.index')->with('success', 'Dapur berhasil ditambahkan.');
    }

    public function edit(Kitchen $kitchen): Response
    {
        return Inertia::render('master-data/kitchens/edit', [
            'kitchen' => $kitchen,
        ]);
    }

    public function update(UpdateKitchenRequest $request, Kitchen $kitchen): RedirectResponse
    {
        $kitchen->update($request->validated());

        return to_route('master-data.kitchens.index')->with('success', 'Dapur berhasil diperbarui.');
    }

    public function destroy(Kitchen $kitchen): RedirectResponse
    {
        try {
            $kitchen->delete();
        } catch (QueryException) {
            return back()->withErrors([
                'kitchen' => 'Dapur tidak bisa dihapus karena masih memiliki data inventaris/kendaraan/tiket. Nonaktifkan saja dapur ini.',
            ]);
        }

        return to_route('master-data.kitchens.index')->with('success', 'Dapur berhasil dihapus.');
    }
}
