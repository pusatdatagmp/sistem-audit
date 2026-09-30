<?php

namespace App\Http\Controllers\Driver;

use App\Http\Controllers\Controller;
use App\Http\Requests\Vehicle\StoreVehicleInspectionRequest;
use App\Models\MasterDataOption;
use App\Models\Vehicle;
use App\Models\VehicleInspection;
use App\Services\Vehicle\VehicleInspectionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DriverInspectionController extends Controller
{
    public function __construct(private readonly VehicleInspectionService $vehicleInspectionService) {}

    public function index(Request $request): Response
    {
        $inspections = VehicleInspection::query()
            ->where('inspected_by', $request->user()->id)
            ->with(['vehicle', 'items.component', 'items.condition'])
            ->orderByDesc('inspected_at')
            ->orderByDesc('id')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('driver/inspections/index', [
            'inspections' => $inspections,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('driver/inspections/create', [
            'vehicles' => Vehicle::query()->where('is_active', true)->orderBy('plate_number')->get(['id', 'plate_number']),
            'components' => MasterDataOption::ofGroup('vehicle_component')->active()->orderBy('sort_order')->get(['id', 'code', 'label']),
            'conditionOptions' => MasterDataOption::ofGroup('physical_condition')->active()->orderBy('sort_order')->get(['id', 'code', 'label']),
        ]);
    }

    public function store(StoreVehicleInspectionRequest $request): RedirectResponse
    {
        $this->vehicleInspectionService->record($request->validated(), $request->user());

        return to_route('driver.inspections.index')->with('success', 'Inspeksi kendaraan berhasil dicatat.');
    }

    public function show(Request $request, VehicleInspection $inspection): Response
    {
        abort_unless($inspection->inspected_by === $request->user()->id, 403);

        return Inertia::render('driver/inspections/show', [
            'inspection' => $inspection->load(['vehicle', 'items.component', 'items.condition']),
        ]);
    }
}
