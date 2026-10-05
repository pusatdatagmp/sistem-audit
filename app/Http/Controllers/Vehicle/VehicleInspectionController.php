<?php

namespace App\Http\Controllers\Vehicle;

use App\Http\Controllers\Concerns\SortsQuery;
use App\Http\Controllers\Controller;
use App\Http\Requests\Vehicle\StoreVehicleInspectionRequest;
use App\Models\MasterDataOption;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\VehicleInspection;
use App\Services\Vehicle\VehicleInspectionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VehicleInspectionController extends Controller
{
    use SortsQuery;

    public function __construct(private readonly VehicleInspectionService $vehicleInspectionService) {}

    public function index(Request $request): Response
    {
        $query = VehicleInspection::query()
            ->with(['vehicle', 'inspectedBy', 'items.component', 'items.condition'])
            ->when($request->integer('vehicle_id'), fn ($query, $vehicleId) => $query->where('vehicle_id', $vehicleId))
            ->when($request->integer('inspected_by'), fn ($query, $userId) => $query->where('inspected_by', $userId));

        $sortable = [
            'inspected_at' => 'vehicle_inspections.inspected_at',
            'odometer' => 'vehicle_inspections.odometer',
            'vehicle' => fn () => Vehicle::query()->select('plate_number')->whereColumn('id', 'vehicle_inspections.vehicle_id'),
            'inspected_by' => fn () => User::query()->select('name')->whereColumn('id', 'vehicle_inspections.inspected_by'),
        ];

        $sortState = $this->applySort(
            $query,
            $request,
            $sortable,
            fn ($q) => $q->orderByDesc('vehicle_inspections.inspected_at')->orderByDesc('vehicle_inspections.id'),
        );

        $inspections = $query->paginate(20)->withQueryString();

        return Inertia::render('vehicles/inspections/index', [
            'inspections' => $inspections,
            'vehicles' => Vehicle::query()->orderBy('plate_number')->get(['id', 'plate_number']),
            'inspectors' => User::query()->orderBy('name')->get(['id', 'name']),
            'filters' => [
                ...$request->only(['vehicle_id', 'inspected_by']),
                ...$sortState,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('vehicles/inspections/create', [
            'vehicles' => Vehicle::query()->where('is_active', true)->orderBy('plate_number')->get(['id', 'plate_number']),
            'components' => MasterDataOption::ofGroup('vehicle_component')->active()->orderBy('sort_order')->get(['id', 'code', 'label']),
            'conditionOptions' => MasterDataOption::ofGroup('physical_condition')->active()->orderBy('sort_order')->get(['id', 'code', 'label']),
        ]);
    }

    public function store(StoreVehicleInspectionRequest $request): RedirectResponse
    {
        $this->vehicleInspectionService->record($request->validated(), $request->user());

        return to_route('vehicles.inspections.index')->with('success', 'Inspeksi kendaraan berhasil dicatat.');
    }

    public function show(VehicleInspection $inspection): Response
    {
        return Inertia::render('vehicles/inspections/show', [
            'inspection' => $inspection->load(['vehicle', 'inspectedBy', 'items.component', 'items.condition']),
        ]);
    }

    public function destroy(VehicleInspection $inspection): RedirectResponse
    {
        $inspection->delete();

        return to_route('vehicles.inspections.index')->with('success', 'Inspeksi kendaraan berhasil dihapus.');
    }
}
