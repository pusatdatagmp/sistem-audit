<?php

namespace App\Http\Controllers\Vehicle;

use App\Http\Controllers\Controller;
use App\Http\Requests\Vehicle\StoreUsageLogRequest;
use App\Http\Requests\Vehicle\UpdateUsageLogRequest;
use App\Models\Kitchen;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleUsageLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VehicleUsageLogController extends Controller
{
    public function index(Request $request): Response
    {
        $usageLogs = VehicleUsageLog::query()
            ->with(['vehicle', 'driver', 'kitchen'])
            ->when($request->integer('vehicle_id'), fn ($query, $vehicleId) => $query->where('vehicle_id', $vehicleId))
            ->when($request->integer('driver_id'), fn ($query, $driverId) => $query->where('driver_id', $driverId))
            ->orderByDesc('usage_date')
            ->orderByDesc('id')
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('vehicles/usage-logs/index', [
            'usageLogs' => $usageLogs,
            'vehicles' => Vehicle::query()->orderBy('plate_number')->get(['id', 'plate_number']),
            'drivers' => User::query()->orderBy('name')->get(['id', 'name']),
            'filters' => $request->only(['vehicle_id', 'driver_id']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('vehicles/usage-logs/create', [
            'vehicles' => Vehicle::query()->where('is_active', true)->orderBy('plate_number')->get(['id', 'plate_number']),
            'drivers' => User::query()->orderBy('name')->get(['id', 'name']),
            'kitchens' => Kitchen::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(StoreUsageLogRequest $request): RedirectResponse
    {
        VehicleUsageLog::create($request->validated());

        return to_route('vehicles.usage-logs.index')->with('success', 'Riwayat pemakaian berhasil dicatat.');
    }

    public function edit(VehicleUsageLog $usageLog): Response
    {
        return Inertia::render('vehicles/usage-logs/edit', [
            'usageLog' => $usageLog->load('vehicle'),
            'drivers' => User::query()->orderBy('name')->get(['id', 'name']),
            'kitchens' => Kitchen::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(UpdateUsageLogRequest $request, VehicleUsageLog $usageLog): RedirectResponse
    {
        $usageLog->update($request->validated());

        return to_route('vehicles.usage-logs.index')->with('success', 'Riwayat pemakaian berhasil diperbarui.');
    }

    public function destroy(VehicleUsageLog $usageLog): RedirectResponse
    {
        $usageLog->delete();

        return to_route('vehicles.usage-logs.index')->with('success', 'Riwayat pemakaian berhasil dihapus.');
    }
}
