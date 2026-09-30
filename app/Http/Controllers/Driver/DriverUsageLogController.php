<?php

namespace App\Http\Controllers\Driver;

use App\Http\Controllers\Controller;
use App\Http\Requests\Driver\StoreDriverUsageLogRequest;
use App\Http\Requests\Driver\UpdateDriverUsageLogRequest;
use App\Models\Kitchen;
use App\Models\Vehicle;
use App\Models\VehicleUsageLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DriverUsageLogController extends Controller
{
    public function index(Request $request): Response
    {
        $usageLogs = VehicleUsageLog::query()
            ->where('driver_id', $request->user()->id)
            ->with(['vehicle', 'kitchen'])
            ->orderByDesc('usage_date')
            ->orderByDesc('id')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('driver/index', [
            'usageLogs' => $usageLogs,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('driver/create', [
            'vehicles' => Vehicle::query()->where('is_active', true)->orderBy('plate_number')->get(['id', 'plate_number']),
            'kitchens' => Kitchen::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(StoreDriverUsageLogRequest $request): RedirectResponse
    {
        VehicleUsageLog::create([
            ...$request->validated(),
            'driver_id' => $request->user()->id,
        ]);

        return to_route('driver.index')->with('success', 'Riwayat pemakaian berhasil dicatat.');
    }

    public function edit(Request $request, VehicleUsageLog $usageLog): Response
    {
        abort_unless($usageLog->driver_id === $request->user()->id, 403);

        return Inertia::render('driver/edit', [
            'usageLog' => $usageLog->load('vehicle'),
            'kitchens' => Kitchen::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(UpdateDriverUsageLogRequest $request, VehicleUsageLog $usageLog): RedirectResponse
    {
        abort_unless($usageLog->driver_id === $request->user()->id, 403);

        $usageLog->update($request->validated());

        return to_route('driver.index')->with('success', 'Riwayat pemakaian berhasil diperbarui.');
    }
}
