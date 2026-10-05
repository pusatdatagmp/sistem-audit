<?php

namespace App\Http\Controllers\Vehicle;

use App\Http\Controllers\Concerns\SortsQuery;
use App\Http\Controllers\Controller;
use App\Http\Requests\Vehicle\CompleteMaintenanceScheduleRequest;
use App\Http\Requests\Vehicle\StoreMaintenanceScheduleRequest;
use App\Http\Requests\Vehicle\UpdateMaintenanceScheduleRequest;
use App\Models\MasterDataOption;
use App\Models\Vehicle;
use App\Models\VehicleMaintenanceSchedule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VehicleMaintenanceScheduleController extends Controller
{
    use SortsQuery;

    public function index(Request $request): Response
    {
        $query = VehicleMaintenanceSchedule::query()
            ->with(['vehicle', 'maintenanceType', 'status'])
            ->when($request->integer('vehicle_id'), fn ($query, $vehicleId) => $query->where('vehicle_id', $vehicleId))
            ->when($request->integer('status_option_id'), fn ($query, $statusOptionId) => $query->where('status_option_id', $statusOptionId))
            ->when($request->integer('maintenance_type_option_id'), function ($query, $typeOptionId) {
                $query->where('maintenance_type_option_id', $typeOptionId);
            });

        $sortable = [
            'vehicle' => fn () => Vehicle::query()->select('plate_number')->whereColumn('id', 'vehicle_maintenance_schedules.vehicle_id'),
            'maintenance_type' => fn () => MasterDataOption::query()
                ->select('label')
                ->whereColumn('id', 'vehicle_maintenance_schedules.maintenance_type_option_id'),
            'scheduled_date' => 'vehicle_maintenance_schedules.scheduled_date',
            'status' => fn () => MasterDataOption::query()->select('label')->whereColumn('id', 'vehicle_maintenance_schedules.status_option_id'),
            'completed_at' => 'vehicle_maintenance_schedules.completed_at',
        ];

        $sortState = $this->applySort($query, $request, $sortable, fn ($q) => $q->orderBy('vehicle_maintenance_schedules.scheduled_date'));

        $schedules = $query->paginate(20)->withQueryString();

        return Inertia::render('vehicles/maintenance/index', [
            'schedules' => $schedules,
            'vehicles' => Vehicle::query()->orderBy('plate_number')->get(['id', 'plate_number']),
            'statusOptions' => MasterDataOption::ofGroup('maintenance_status')->active()->orderBy('sort_order')->get(['id', 'code', 'label']),
            'typeOptions' => MasterDataOption::ofGroup('maintenance_type')->active()->orderBy('sort_order')->get(['id', 'code', 'label']),
            'filters' => [
                ...$request->only(['vehicle_id', 'status_option_id', 'maintenance_type_option_id']),
                ...$sortState,
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('vehicles/maintenance/create', [
            'vehicles' => Vehicle::query()->where('is_active', true)->orderBy('plate_number')->get(['id', 'plate_number']),
            'typeOptions' => MasterDataOption::ofGroup('maintenance_type')->active()->orderBy('sort_order')->get(['id', 'code', 'label']),
            'statusOptions' => MasterDataOption::ofGroup('maintenance_status')->active()->orderBy('sort_order')->get(['id', 'code', 'label']),
        ]);
    }

    public function store(StoreMaintenanceScheduleRequest $request): RedirectResponse
    {
        VehicleMaintenanceSchedule::create($request->validated());

        return to_route('vehicles.maintenance.index')->with('success', 'Jadwal perawatan berhasil ditambahkan.');
    }

    public function edit(VehicleMaintenanceSchedule $maintenanceSchedule): Response
    {
        return Inertia::render('vehicles/maintenance/edit', [
            'schedule' => $maintenanceSchedule->load('vehicle'),
            'typeOptions' => MasterDataOption::ofGroup('maintenance_type')->active()->orderBy('sort_order')->get(['id', 'code', 'label']),
            'statusOptions' => MasterDataOption::ofGroup('maintenance_status')->active()->orderBy('sort_order')->get(['id', 'code', 'label']),
        ]);
    }

    public function update(UpdateMaintenanceScheduleRequest $request, VehicleMaintenanceSchedule $maintenanceSchedule): RedirectResponse
    {
        $maintenanceSchedule->update($request->validated());

        return to_route('vehicles.maintenance.index')->with('success', 'Jadwal perawatan berhasil diperbarui.');
    }

    public function complete(CompleteMaintenanceScheduleRequest $request, VehicleMaintenanceSchedule $maintenanceSchedule): RedirectResponse
    {
        $completedStatus = MasterDataOption::ofGroup('maintenance_status')->where('code', 'selesai')->first();

        $maintenanceSchedule->update([
            'status_option_id' => $completedStatus?->id ?? $maintenanceSchedule->status_option_id,
            'completed_at' => now(),
            'completed_by' => $request->user()->id,
            'notes' => $request->input('notes', $maintenanceSchedule->notes),
        ]);

        return back()->with('success', 'Jadwal perawatan ditandai selesai.');
    }

    public function destroy(VehicleMaintenanceSchedule $maintenanceSchedule): RedirectResponse
    {
        $maintenanceSchedule->delete();

        return to_route('vehicles.maintenance.index')->with('success', 'Jadwal perawatan berhasil dihapus.');
    }
}
