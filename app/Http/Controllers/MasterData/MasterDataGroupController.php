<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Http\Requests\MasterData\StoreMasterDataGroupRequest;
use App\Models\MasterDataGroup;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class MasterDataGroupController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('master-data/option-groups/index', [
            'groups' => MasterDataGroup::query()
                ->withCount('options')
                ->orderBy('name')
                ->get(),
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

    public function show(MasterDataGroup $group): Response
    {
        return Inertia::render('master-data/option-groups/show', [
            'group' => $group,
            'options' => $group->options()->orderBy('sort_order')->orderBy('label')->get(),
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
