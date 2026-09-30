<?php

namespace App\Http\Controllers\MasterData;

use App\Http\Controllers\Controller;
use App\Http\Requests\MasterData\StoreKitchenRequest;
use App\Http\Requests\MasterData\UpdateKitchenRequest;
use App\Models\Kitchen;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class KitchenController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('master-data/kitchens/index', [
            'kitchens' => Kitchen::query()->orderBy('name')->paginate(20),
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
