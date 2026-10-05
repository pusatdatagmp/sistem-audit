<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Concerns\SortsQuery;
use App\Http\Controllers\Controller;
use App\Http\Requests\MasterData\StoreMasterDataGroupRequest;
use App\Models\MasterDataGroup;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MasterDataGroupController extends Controller
{
    use SortsQuery;

    /**
     * @var array<string, string>
     */
    private const GROUP_SORTABLE = [
        'code' => 'code',
        'name' => 'name',
        'options_count' => 'options_count',
    ];

    /**
     * @var array<string, string>
     */
    private const OPTION_SORTABLE = [
        'sort_order' => 'sort_order',
        'label' => 'label',
        'code' => 'code',
        'is_active' => 'is_active',
    ];

    public function index(Request $request): Response
    {
        $query = MasterDataGroup::query()
            ->withCount('options')
            ->when($request->string('search')->toString(), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%");
                });
            });

        $sortState = $this->applySort($query, $request, self::GROUP_SORTABLE, fn ($q) => $q->orderBy('name'));

        return Inertia::render('master-data/option-groups/index', [
            'groups' => $query->paginate(20)->withQueryString(),
            'filters' => [
                ...$request->only(['search']),
                ...$sortState,
            ],
        ]);
    }

    public function store(StoreMasterDataGroupRequest $request): RedirectResponse
    {
        MasterDataGroup::create([
            ...$request->validated(),
            'is_locked' => false,
        ]);

        return back()->with('success', 'Grup kategori berhasil ditambahkan.');
    }

    public function show(Request $request, MasterDataGroup $group): Response
    {
        $query = $group->options()
            ->when($request->has('is_active'), fn ($q) => $q->where('is_active', $request->boolean('is_active')))
            ->when($request->string('search')->toString(), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('label', 'like', "%{$search}%")
                        ->orWhere('code', 'like', "%{$search}%");
                });
            });

        $sortState = $this->applySort($query, $request, self::OPTION_SORTABLE, fn ($q) => $q->orderBy('sort_order')->orderBy('label'));

        return Inertia::render('master-data/option-groups/show', [
            'group' => $group,
            'options' => $query->paginate(20)->withQueryString(),
            'filters' => [
                ...$request->only(['is_active', 'search']),
                ...$sortState,
            ],
        ]);
    }

    public function destroy(MasterDataGroup $group): RedirectResponse
    {
        if ($group->is_locked) {
            return back()->withErrors(['group' => 'Grup ini digunakan oleh sistem dan tidak bisa dihapus.']);
        }

        try {
            $group->delete();
        } catch (QueryException) {
            return back()->withErrors(['group' => 'Grup tidak bisa dihapus karena opsinya masih digunakan di data lain.']);
        }

        return to_route('master-data.option-groups.index')->with('success', 'Grup kategori berhasil dihapus.');
    }
}
