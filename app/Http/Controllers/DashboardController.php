<?php

namespace App\Http\Controllers;

use App\Models\ComplaintTicket;
use App\Models\Kitchen;
use App\Models\KitchenInventory;
use App\Models\KitchenTool;
use App\Models\Permission;
use App\Models\Vehicle;
use App\Models\VehicleMaintenanceSchedule;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * @var list<int>
     */
    private const TREND_RANGES = [7, 14, 30];

    public function index(Request $request): Response
    {
        $user = $request->user();

        $canSeeTickets = $user->hasPermission(Permission::TICKETS_MANAGE);
        $canSeeVehicles = $user->hasPermission(Permission::VEHICLES_MANAGE);
        $canSeeInventory = $user->hasPermission(Permission::INVENTORY_MANAGE);

        $data = [];

        if ($canSeeTickets) {
            $data['ticketStats'] = fn () => $this->ticketStats();
            $data['ticketTrend'] = fn () => $this->ticketTrend($this->trendDaysFromRequest($request));
            $data['ticketStatusBreakdown'] = fn () => $this->ticketStatusBreakdown($request->integer('ticket_status_kitchen_id') ?: null);
            $data['recentTickets'] = fn () => $this->recentTickets($request->string('recent_status')->toString() ?: null);
        }

        if ($canSeeVehicles) {
            $data['vehicleStats'] = fn () => $this->vehicleStats();
            $data['vehicleStatusBreakdown'] = fn () => $this->vehicleStatusBreakdown($request->integer('vehicle_status_kitchen_id') ?: null);
            $data['upcomingMaintenance'] = fn () => $this->upcomingMaintenance($request->integer('maintenance_vehicle_id') ?: null);
            $data['vehicleOptions'] = fn () => Vehicle::query()->orderBy('plate_number')->get(['id', 'plate_number']);
        }

        if ($canSeeInventory) {
            $data['inventoryStats'] = fn () => $this->inventoryStats();
            $data['inventoryConditionBreakdown'] = fn () => $this->inventoryConditionBreakdown($request->integer('inventory_kitchen_id') ?: null);
        }

        if ($canSeeTickets || $canSeeVehicles || $canSeeInventory) {
            $data['kitchenOptions'] = fn () => Kitchen::query()->orderBy('name')->get(['id', 'name']);
        }

        return Inertia::render('dashboard', $data);
    }

    private function trendDaysFromRequest(Request $request): int
    {
        $days = $request->integer('trend_days', 14);

        return in_array($days, self::TREND_RANGES, true) ? $days : 14;
    }

    /**
     * @return array<string, mixed>
     */
    private function ticketStats(): array
    {
        $counts = ComplaintTicket::query()
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $criticalOpen = ComplaintTicket::query()
            ->where('status', '!=', ComplaintTicket::STATUS_RESOLVED)
            ->whereHas('priority', fn ($query) => $query->where('code', 'kritis'))
            ->count();

        $resolvedThisMonth = ComplaintTicket::query()
            ->where('status', ComplaintTicket::STATUS_RESOLVED)
            ->whereBetween('resolved_at', [now()->startOfMonth(), now()->endOfMonth()])
            ->count();

        return [
            'open' => (int) ($counts[ComplaintTicket::STATUS_OPEN] ?? 0),
            'in_progress' => (int) ($counts[ComplaintTicket::STATUS_IN_PROGRESS] ?? 0),
            'resolved' => (int) ($counts[ComplaintTicket::STATUS_RESOLVED] ?? 0),
            'total' => (int) $counts->sum(),
            'critical_open' => $criticalOpen,
            'resolved_this_month' => $resolvedThisMonth,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function ticketTrend(int $days): array
    {
        $since = now()->subDays($days - 1)->startOfDay();

        $raw = ComplaintTicket::query()
            ->selectRaw('DATE(created_at) as day, count(*) as total')
            ->where('created_at', '>=', $since)
            ->groupBy('day')
            ->pluck('total', 'day');

        $points = collect(range($days - 1, 0))
            ->map(function (int $daysAgo) use ($raw) {
                $date = now()->subDays($daysAgo)->format('Y-m-d');

                return [
                    'date' => $date,
                    'total' => (int) ($raw[$date] ?? 0),
                ];
            })
            ->values()
            ->all();

        return [
            'days' => $days,
            'points' => $points,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function ticketStatusBreakdown(?int $kitchenId): array
    {
        $counts = ComplaintTicket::query()
            ->when($kitchenId, fn ($query, $id) => $query->where('kitchen_id', $id))
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        return [
            'kitchen_id' => $kitchenId,
            'open' => (int) ($counts[ComplaintTicket::STATUS_OPEN] ?? 0),
            'in_progress' => (int) ($counts[ComplaintTicket::STATUS_IN_PROGRESS] ?? 0),
            'resolved' => (int) ($counts[ComplaintTicket::STATUS_RESOLVED] ?? 0),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function recentTickets(?string $status): array
    {
        $items = ComplaintTicket::query()
            ->when($status, fn ($query, $value) => $query->where('status', $value))
            ->with(['kitchen', 'priority'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn (ComplaintTicket $ticket) => [
                'id' => $ticket->id,
                'ticket_number' => $ticket->ticket_number,
                'subject' => $ticket->subject,
                'status' => $ticket->status,
                'kitchen' => $ticket->kitchen?->name,
                'priority' => $ticket->priority?->label,
                'created_at' => $ticket->created_at?->toIso8601String(),
            ])
            ->values();

        return [
            'status' => $status,
            'items' => $items,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function vehicleStats(): array
    {
        $today = Carbon::today();

        $overdueMaintenance = VehicleMaintenanceSchedule::query()
            ->whereHas('status', fn ($query) => $query->where('code', '!=', 'selesai'))
            ->whereDate('scheduled_date', '<', $today)
            ->count();

        return [
            'total' => Vehicle::query()->count(),
            'active' => Vehicle::query()->where('is_active', true)->count(),
            'overdue_maintenance' => $overdueMaintenance,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function vehicleStatusBreakdown(?int $kitchenId): array
    {
        $items = Vehicle::query()
            ->when($kitchenId, fn ($query, $id) => $query->where('home_kitchen_id', $id))
            ->with('status')
            ->get()
            ->groupBy(fn (Vehicle $vehicle) => $vehicle->status?->label ?? 'Tidak Diketahui')
            ->map(fn ($group, $label) => ['label' => $label, 'total' => $group->count()])
            ->values();

        return [
            'kitchen_id' => $kitchenId,
            'items' => $items,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function upcomingMaintenance(?int $vehicleId): array
    {
        $today = Carbon::today();

        $items = VehicleMaintenanceSchedule::query()
            ->when($vehicleId, fn ($query, $id) => $query->where('vehicle_id', $id))
            ->with(['vehicle', 'maintenanceType'])
            ->whereHas('status', fn ($query) => $query->where('code', '!=', 'selesai'))
            ->orderBy('scheduled_date')
            ->limit(5)
            ->get()
            ->map(fn (VehicleMaintenanceSchedule $schedule) => [
                'id' => $schedule->id,
                'vehicle' => $schedule->vehicle?->plate_number,
                'type' => $schedule->maintenanceType?->label,
                'scheduled_date' => $schedule->scheduled_date?->format('Y-m-d'),
                'is_overdue' => $schedule->scheduled_date?->lt($today) ?? false,
            ])
            ->values();

        return [
            'vehicle_id' => $vehicleId,
            'items' => $items,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function inventoryStats(): array
    {
        $totals = KitchenInventory::query()
            ->selectRaw('
                COALESCE(SUM(quantity_good + quantity_needs_repair + quantity_damaged), 0) as total_quantity,
                COALESCE(SUM(quantity_needs_repair), 0) as needs_repair,
                COALESCE(SUM(quantity_damaged), 0) as damaged
            ')
            ->first();

        $attentionCount = KitchenInventory::query()
            ->where('quantity_needs_repair', '>', 0)
            ->orWhere('quantity_damaged', '>', 0)
            ->count();

        return [
            'total_quantity' => (int) ($totals->total_quantity ?? 0),
            'needs_repair' => (int) ($totals->needs_repair ?? 0),
            'damaged' => (int) ($totals->damaged ?? 0),
            'attention_count' => $attentionCount,
            'tool_types_count' => KitchenTool::query()->where('is_active', true)->count(),
            'kitchens_count' => Kitchen::query()->where('is_active', true)->count(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function inventoryConditionBreakdown(?int $kitchenId): array
    {
        $totals = KitchenInventory::query()
            ->when($kitchenId, fn ($query, $id) => $query->where('kitchen_id', $id))
            ->selectRaw('COALESCE(SUM(quantity_good), 0) as good, COALESCE(SUM(quantity_needs_repair), 0) as needs_repair, COALESCE(SUM(quantity_damaged), 0) as damaged')
            ->first();

        return [
            'kitchen_id' => $kitchenId,
            'good' => (int) ($totals->good ?? 0),
            'needs_repair' => (int) ($totals->needs_repair ?? 0),
            'damaged' => (int) ($totals->damaged ?? 0),
        ];
    }
}
