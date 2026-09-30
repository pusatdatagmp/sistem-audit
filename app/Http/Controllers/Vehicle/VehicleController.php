<?php

namespace App\Http\Controllers\Vehicle;

use App\Http\Controllers\Controller;
use App\Http\Requests\Vehicle\StoreVehicleRequest;
use App\Http\Requests\Vehicle\UpdateVehicleRequest;
use App\Models\Kitchen;
use App\Models\MasterDataOption;
use App\Models\Vehicle;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VehicleController extends Controller
{
    public function index(Request $request): Response
    {
        $vehicles = Vehicle::query()
            ->with(['vehicleType', 'status', 'homeKitchen'])
            ->when($request->integer('status_option_id'), fn ($query, $statusOptionId) => $query->where('status_option_id', $statusOptionId))
            ->when($request->integer('vehicle_type_option_id'), function ($query, $typeOptionId) {
                $query->where('vehicle_type_option_id', $typeOptionId);
            })
            ->when($request->string('search')->toString(), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('plate_number', 'like', "%{$search}%")
                        ->orWhere('brand', 'like', "%{$search}%")
                        ->orWhere('model', 'like', "%{$search}%");
                });
            })
            ->orderBy('plate_number')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('vehicles/index', [
            'vehicles' => $vehicles,
            'typeOptions' => MasterDataOption::ofGroup('vehicle_type')->active()->orderBy('sort_order')->get(['id', 'code', 'label']),
            'statusOptions' => MasterDataOption::ofGroup('vehicle_status')->active()->orderBy('sort_order')->get(['id', 'code', 'label']),
            'filters' => $request->only(['status_option_id', 'vehicle_type_option_id', 'search']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('vehicles/create', [
            'typeOptions' => MasterDataOption::ofGroup('vehicle_type')->active()->orderBy('sort_order')->get(['id', 'code', 'label']),
            'statusOptions' => MasterDataOption::ofGroup('vehicle_status')->active()->orderBy('sort_order')->get(['id', 'code', 'label']),
            'kitchens' => Kitchen::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(StoreVehicleRequest $request): RedirectResponse
    {
        Vehicle::create($request->validated());

        return to_route('vehicles.index')->with('success', 'Kendaraan berhasil ditambahkan.');
    }

    public function edit(Vehicle $vehicle): Response
    {
        return Inertia::render('vehicles/edit', [
            'vehicle' => $vehicle,
            'typeOptions' => MasterDataOption::ofGroup('vehicle_type')->active()->orderBy('sort_order')->get(['id', 'code', 'label']),
            'statusOptions' => MasterDataOption::ofGroup('vehicle_status')->active()->orderBy('sort_order')->get(['id', 'code', 'label']),
            'kitchens' => Kitchen::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(UpdateVehicleRequest $request, Vehicle $vehicle): RedirectResponse
    {
        $vehicle->update($request->validated());

        return to_route('vehicles.index')->with('success', 'Kendaraan berhasil diperbarui.');
    }

    public function destroy(Vehicle $vehicle): RedirectResponse
    {
        try {
            $vehicle->delete();
        } catch (QueryException) {
            return back()->withErrors([
                'vehicle' => 'Kendaraan tidak bisa dihapus karena masih memiliki riwayat perawatan/pemakaian/tiket. Nonaktifkan saja kendaraan ini.',
            ]);
        }

        return to_route('vehicles.index')->with('success', 'Kendaraan berhasil dihapus.');
    }
}
