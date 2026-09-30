import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFlashToast } from '@/hooks/use-flash-toast';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { BarList, type BarListItem } from '@/pages/dashboard/components/bar-list';
import { StatCard } from '@/pages/dashboard/components/stat-card';
import { TicketTrendChart, type TrendPoint } from '@/pages/dashboard/components/ticket-trend-chart';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    Boxes,
    CalendarClock,
    CheckCircle2,
    ChefHat,
    CircleSlash,
    ClipboardList,
    Clock,
    PackagePlus,
    Truck,
    Wrench,
} from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

const TICKET_STATUS_LABELS: Record<string, string> = {
    open: 'Open',
    in_progress: 'In Progress',
    resolved: 'Resolved',
};

function ticketStatusBadgeVariant(status: string): 'default' | 'outline' | 'destructive' {
    if (status === 'resolved') return 'default';
    if (status === 'in_progress') return 'outline';
    return 'destructive';
}

interface KitchenOption {
    id: number;
    name: string;
}

interface VehicleOption {
    id: number;
    plate_number: string;
}

interface TicketStats {
    open: number;
    in_progress: number;
    resolved: number;
    total: number;
    critical_open: number;
    resolved_this_month: number;
}

interface TicketTrendData {
    days: number;
    points: TrendPoint[];
}

interface TicketStatusBreakdown {
    kitchen_id: number | null;
    open: number;
    in_progress: number;
    resolved: number;
}

interface RecentTicket {
    id: number;
    ticket_number: string;
    subject: string;
    status: 'open' | 'in_progress' | 'resolved';
    kitchen: string | null;
    priority: string | null;
    created_at: string | null;
}

interface RecentTicketsData {
    status: string | null;
    items: RecentTicket[];
}

interface VehicleStats {
    total: number;
    active: number;
    overdue_maintenance: number;
}

interface VehicleStatusBreakdown {
    kitchen_id: number | null;
    items: { label: string; total: number }[];
}

interface UpcomingMaintenanceItem {
    id: number;
    vehicle: string | null;
    type: string | null;
    scheduled_date: string | null;
    is_overdue: boolean;
}

interface UpcomingMaintenanceData {
    vehicle_id: number | null;
    items: UpcomingMaintenanceItem[];
}

interface InventoryStats {
    total_quantity: number;
    needs_repair: number;
    damaged: number;
    attention_count: number;
    tool_types_count: number;
    kitchens_count: number;
}

interface InventoryConditionBreakdown {
    kitchen_id: number | null;
    good: number;
    needs_repair: number;
    damaged: number;
}

interface DashboardProps {
    ticketStats?: TicketStats;
    ticketTrend?: TicketTrendData;
    ticketStatusBreakdown?: TicketStatusBreakdown;
    recentTickets?: RecentTicketsData;
    vehicleStats?: VehicleStats;
    vehicleStatusBreakdown?: VehicleStatusBreakdown;
    upcomingMaintenance?: UpcomingMaintenanceData;
    inventoryStats?: InventoryStats;
    inventoryConditionBreakdown?: InventoryConditionBreakdown;
    kitchenOptions?: KitchenOption[];
    vehicleOptions?: VehicleOption[];
}

function vehicleStatusStyle(label: string): { barClassName: string; textClassName: string } {
    const normalized = label.toLowerCase();

    if (normalized.includes('aktif') && !normalized.includes('non')) {
        return { barClassName: 'bg-emerald-500', textClassName: 'text-emerald-600 dark:text-emerald-400' };
    }

    if (normalized.includes('perbaikan')) {
        return { barClassName: 'bg-amber-500', textClassName: 'text-amber-600 dark:text-amber-400' };
    }

    return { barClassName: 'bg-muted-foreground/50', textClassName: 'text-muted-foreground' };
}

/**
 * Reloads a single dashboard widget's prop via an Inertia partial reload, so
 * changing one widget's filter never re-fetches or flickers the others.
 */
function useWidgetFilter(prop: string) {
    const [loading, setLoading] = useState(false);

    function apply(data: Record<string, string | number | undefined>) {
        setLoading(true);
        router.reload({
            data,
            only: [prop],
            onFinish: () => setLoading(false),
        });
    }

    return { loading, apply };
}

interface WidgetFilterSelectProps {
    value: string;
    onValueChange: (value: string) => void;
    placeholder: string;
    options: { value: string; label: string }[];
}

function WidgetFilterSelect({ value, onValueChange, placeholder, options }: WidgetFilterSelectProps) {
    return (
        <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger className="h-8 w-40 text-xs">
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

export default function Dashboard({
    ticketStats,
    ticketTrend,
    ticketStatusBreakdown,
    recentTickets,
    vehicleStats,
    vehicleStatusBreakdown,
    upcomingMaintenance,
    inventoryStats,
    inventoryConditionBreakdown,
    kitchenOptions = [],
    vehicleOptions = [],
}: DashboardProps) {
    useFlashToast();

    const { auth } = usePage<SharedData>().props;
    const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    const hasAnyData = Boolean(ticketStats || vehicleStats || inventoryStats);

    const trendFilter = useWidgetFilter('ticketTrend');
    const ticketStatusFilter = useWidgetFilter('ticketStatusBreakdown');
    const vehicleStatusFilter = useWidgetFilter('vehicleStatusBreakdown');
    const inventoryConditionFilter = useWidgetFilter('inventoryConditionBreakdown');
    const recentTicketsFilter = useWidgetFilter('recentTickets');
    const maintenanceFilter = useWidgetFilter('upcomingMaintenance');

    const kitchenFilterOptions = [
        { value: 'all', label: 'Semua Dapur' },
        ...kitchenOptions.map((kitchen) => ({ value: String(kitchen.id), label: kitchen.name })),
    ];

    const ticketStatusItems: BarListItem[] = ticketStatusBreakdown
        ? [
              {
                  key: 'open',
                  label: 'Open',
                  value: ticketStatusBreakdown.open,
                  icon: AlertTriangle,
                  barClassName: 'bg-rose-500',
                  textClassName: 'text-rose-600 dark:text-rose-400',
              },
              {
                  key: 'in_progress',
                  label: 'In Progress',
                  value: ticketStatusBreakdown.in_progress,
                  icon: Clock,
                  barClassName: 'bg-sky-500',
                  textClassName: 'text-sky-600 dark:text-sky-400',
              },
              {
                  key: 'resolved',
                  label: 'Resolved',
                  value: ticketStatusBreakdown.resolved,
                  icon: CheckCircle2,
                  barClassName: 'bg-emerald-500',
                  textClassName: 'text-emerald-600 dark:text-emerald-400',
              },
          ]
        : [];

    const vehicleStatusItems: BarListItem[] = (vehicleStatusBreakdown?.items ?? []).map((item) => ({
        key: item.label,
        label: item.label,
        value: item.total,
        icon: item.label.toLowerCase().includes('non') ? CircleSlash : item.label.toLowerCase().includes('perbaikan') ? Wrench : CheckCircle2,
        ...vehicleStatusStyle(item.label),
    }));

    const inventoryConditionItems: BarListItem[] = inventoryConditionBreakdown
        ? [
              {
                  key: 'good',
                  label: 'Baik',
                  value: inventoryConditionBreakdown.good,
                  icon: CheckCircle2,
                  barClassName: 'bg-emerald-500',
                  textClassName: 'text-emerald-600 dark:text-emerald-400',
              },
              {
                  key: 'needs_repair',
                  label: 'Perlu Perbaikan',
                  value: inventoryConditionBreakdown.needs_repair,
                  icon: Wrench,
                  barClassName: 'bg-amber-500',
                  textClassName: 'text-amber-600 dark:text-amber-400',
              },
              {
                  key: 'damaged',
                  label: 'Rusak Berat',
                  value: inventoryConditionBreakdown.damaged,
                  icon: AlertTriangle,
                  barClassName: 'bg-rose-500',
                  textClassName: 'text-rose-600 dark:text-rose-400',
              },
          ]
        : [];

    const canCreateTicket = auth.permissions.includes('tickets.manage');
    const canManageVehicles = auth.permissions.includes('vehicles.manage');
    const canManageInventory = auth.permissions.includes('inventory.manage');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-1 flex-col gap-6 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">Halo, {auth.user.name.split(' ')[0]} 👋</h1>
                        <p className="text-muted-foreground text-sm capitalize">{today}</p>
                    </div>

                    {(canCreateTicket || canManageVehicles || canManageInventory) && (
                        <div className="flex flex-wrap gap-2">
                            {canCreateTicket && (
                                <Button size="sm" asChild>
                                    <Link href={route('tickets.create')}>
                                        <AlertTriangle className="size-4" />
                                        Buat Tiket
                                    </Link>
                                </Button>
                            )}
                            {canManageVehicles && (
                                <Button size="sm" variant="outline" asChild>
                                    <Link href={route('vehicles.maintenance.create')}>
                                        <CalendarClock className="size-4" />
                                        Jadwalkan Perawatan
                                    </Link>
                                </Button>
                            )}
                            {canManageInventory && (
                                <Button size="sm" variant="outline" asChild>
                                    <Link href={route('inventory.index')}>
                                        <PackagePlus className="size-4" />
                                        Catat Mutasi Stok
                                    </Link>
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {!hasAnyData && (
                    <Card>
                        <CardContent className="text-muted-foreground p-6 text-sm">
                            Belum ada modul yang bisa ditampilkan untuk akun Anda. Hubungi admin jika ini tidak sesuai.
                        </CardContent>
                    </Card>
                )}

                {(ticketStats || vehicleStats || inventoryStats) && (
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                        {ticketStats && (
                            <StatCard
                                label="Tiket Terbuka"
                                value={ticketStats.open + ticketStats.in_progress}
                                hint={ticketStats.critical_open > 0 ? `${ticketStats.critical_open} prioritas kritis` : 'Tidak ada prioritas kritis'}
                                icon={AlertTriangle}
                                tone={ticketStats.critical_open > 0 ? 'critical' : 'default'}
                            />
                        )}
                        {ticketStats && (
                            <StatCard
                                label="Tiket Selesai Bulan Ini"
                                value={ticketStats.resolved_this_month}
                                hint={`${ticketStats.total} total tiket tercatat`}
                                icon={CheckCircle2}
                                tone="success"
                            />
                        )}
                        {vehicleStats && (
                            <StatCard
                                label="Kendaraan Aktif"
                                value={`${vehicleStats.active}/${vehicleStats.total}`}
                                hint={
                                    vehicleStats.overdue_maintenance > 0
                                        ? `${vehicleStats.overdue_maintenance} jadwal perawatan terlambat`
                                        : 'Semua jadwal perawatan aman'
                                }
                                icon={Truck}
                                tone={vehicleStats.overdue_maintenance > 0 ? 'warning' : 'default'}
                            />
                        )}
                        {inventoryStats && (
                            <StatCard
                                label="Total Alat Inventaris"
                                value={inventoryStats.total_quantity}
                                hint={`${inventoryStats.tool_types_count} jenis alat · ${inventoryStats.kitchens_count} dapur aktif`}
                                icon={Boxes}
                                tone="default"
                            />
                        )}
                        {inventoryStats && (
                            <StatCard
                                label="Alat Perlu Perhatian"
                                value={inventoryStats.attention_count}
                                hint={`${inventoryStats.needs_repair} perlu perbaikan · ${inventoryStats.damaged} rusak berat`}
                                icon={ChefHat}
                                tone={inventoryStats.attention_count > 0 ? 'warning' : 'success'}
                            />
                        )}
                    </div>
                )}

                {ticketStats && (
                    <div className="grid gap-4 lg:grid-cols-3">
                        <Card className="lg:col-span-2">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                <div>
                                    <CardTitle className="text-base">Tren Tiket Masuk</CardTitle>
                                    <CardDescription>Jumlah tiket pengaduan baru per hari.</CardDescription>
                                </div>
                                <WidgetFilterSelect
                                    value={String(ticketTrend?.days ?? 14)}
                                    onValueChange={(value) => trendFilter.apply({ trend_days: value })}
                                    placeholder="Rentang waktu"
                                    options={[
                                        { value: '7', label: '7 hari terakhir' },
                                        { value: '14', label: '14 hari terakhir' },
                                        { value: '30', label: '30 hari terakhir' },
                                    ]}
                                />
                            </CardHeader>
                            <CardContent className={cn('transition-opacity', trendFilter.loading && 'opacity-50')}>
                                {ticketTrend && <TicketTrendChart data={ticketTrend.points} days={ticketTrend.days} />}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                <div>
                                    <CardTitle className="text-base">Status Tiket</CardTitle>
                                    <CardDescription>Distribusi tiket berdasarkan status saat ini.</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent className={cn('flex flex-col gap-3 transition-opacity', ticketStatusFilter.loading && 'opacity-50')}>
                                <WidgetFilterSelect
                                    value={ticketStatusBreakdown?.kitchen_id ? String(ticketStatusBreakdown.kitchen_id) : 'all'}
                                    onValueChange={(value) =>
                                        ticketStatusFilter.apply({ ticket_status_kitchen_id: value === 'all' ? undefined : value })
                                    }
                                    placeholder="Semua Dapur"
                                    options={kitchenFilterOptions}
                                />
                                <BarList items={ticketStatusItems} />
                            </CardContent>
                        </Card>
                    </div>
                )}

                {(vehicleStats || inventoryStats) && (
                    <div className="grid gap-4 lg:grid-cols-2">
                        {vehicleStats && (
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                    <div>
                                        <CardTitle className="text-base">Status Kendaraan</CardTitle>
                                        <CardDescription>Kondisi armada saat ini.</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent className={cn('flex flex-col gap-3 transition-opacity', vehicleStatusFilter.loading && 'opacity-50')}>
                                    <WidgetFilterSelect
                                        value={vehicleStatusBreakdown?.kitchen_id ? String(vehicleStatusBreakdown.kitchen_id) : 'all'}
                                        onValueChange={(value) =>
                                            vehicleStatusFilter.apply({ vehicle_status_kitchen_id: value === 'all' ? undefined : value })
                                        }
                                        placeholder="Semua Dapur"
                                        options={kitchenFilterOptions}
                                    />
                                    <BarList items={vehicleStatusItems} />
                                </CardContent>
                            </Card>
                        )}

                        {inventoryStats && (
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                    <div>
                                        <CardTitle className="text-base">Kondisi Inventaris</CardTitle>
                                        <CardDescription>Total kondisi alat dapur.</CardDescription>
                                    </div>
                                </CardHeader>
                                <CardContent
                                    className={cn('flex flex-col gap-3 transition-opacity', inventoryConditionFilter.loading && 'opacity-50')}
                                >
                                    <WidgetFilterSelect
                                        value={inventoryConditionBreakdown?.kitchen_id ? String(inventoryConditionBreakdown.kitchen_id) : 'all'}
                                        onValueChange={(value) =>
                                            inventoryConditionFilter.apply({ inventory_kitchen_id: value === 'all' ? undefined : value })
                                        }
                                        placeholder="Semua Dapur"
                                        options={kitchenFilterOptions}
                                    />
                                    <BarList items={inventoryConditionItems} />
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}

                {(ticketStats || vehicleStats) && (
                    <div className="grid gap-4 lg:grid-cols-3">
                        {ticketStats && (
                            <Card className="lg:col-span-2">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                    <div>
                                        <CardTitle className="text-base">Tiket Terbaru</CardTitle>
                                        <CardDescription>5 pengaduan yang baru masuk.</CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <WidgetFilterSelect
                                            value={recentTickets?.status ?? 'all'}
                                            onValueChange={(value) =>
                                                recentTicketsFilter.apply({ recent_status: value === 'all' ? undefined : value })
                                            }
                                            placeholder="Semua Status"
                                            options={[
                                                { value: 'all', label: 'Semua Status' },
                                                { value: 'open', label: 'Open' },
                                                { value: 'in_progress', label: 'In Progress' },
                                                { value: 'resolved', label: 'Resolved' },
                                            ]}
                                        />
                                        <Button size="sm" variant="ghost" asChild>
                                            <Link href={route('tickets.index')}>
                                                Lihat semua
                                                <ArrowRight className="size-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className={cn('transition-opacity', recentTicketsFilter.loading && 'opacity-50')}>
                                    {!recentTickets || recentTickets.items.length === 0 ? (
                                        <p className="text-muted-foreground text-sm">Belum ada tiket yang cocok dengan filter ini.</p>
                                    ) : (
                                        <div className="flex flex-col divide-y">
                                            {recentTickets.items.map((ticket) => (
                                                <Link
                                                    key={ticket.id}
                                                    href={route('tickets.show', ticket.id)}
                                                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0 hover:opacity-80"
                                                >
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-muted-foreground font-mono text-xs">{ticket.ticket_number}</span>
                                                            {ticket.priority && (
                                                                <Badge variant="secondary" className="text-[10px]">
                                                                    {ticket.priority}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="truncate text-sm font-medium">{ticket.subject}</p>
                                                        <p className="text-muted-foreground truncate text-xs">{ticket.kitchen ?? 'Tanpa dapur'}</p>
                                                    </div>
                                                    <Badge variant={ticketStatusBadgeVariant(ticket.status)} className="shrink-0">
                                                        {TICKET_STATUS_LABELS[ticket.status]}
                                                    </Badge>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {vehicleStats && (
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                    <div>
                                        <CardTitle className="text-base">Perawatan Mendatang</CardTitle>
                                        <CardDescription>Jadwal yang belum selesai.</CardDescription>
                                    </div>
                                    <Button size="sm" variant="ghost" asChild>
                                        <Link href={route('vehicles.maintenance.index')}>
                                            <ClipboardList className="size-4" />
                                        </Link>
                                    </Button>
                                </CardHeader>
                                <CardContent className={cn('flex flex-col gap-3 transition-opacity', maintenanceFilter.loading && 'opacity-50')}>
                                    <WidgetFilterSelect
                                        value={upcomingMaintenance?.vehicle_id ? String(upcomingMaintenance.vehicle_id) : 'all'}
                                        onValueChange={(value) =>
                                            maintenanceFilter.apply({ maintenance_vehicle_id: value === 'all' ? undefined : value })
                                        }
                                        placeholder="Semua Kendaraan"
                                        options={[
                                            { value: 'all', label: 'Semua Kendaraan' },
                                            ...vehicleOptions.map((vehicle) => ({ value: String(vehicle.id), label: vehicle.plate_number })),
                                        ]}
                                    />

                                    {!upcomingMaintenance || upcomingMaintenance.items.length === 0 ? (
                                        <p className="text-muted-foreground text-sm">Tidak ada jadwal perawatan mendatang.</p>
                                    ) : (
                                        <div className="flex flex-col divide-y">
                                            {upcomingMaintenance.items.map((schedule) => (
                                                <div key={schedule.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-medium">{schedule.vehicle ?? '-'}</p>
                                                        <p className="text-muted-foreground truncate text-xs">{schedule.type ?? '-'}</p>
                                                    </div>
                                                    <div className="shrink-0 text-right">
                                                        <p className="text-muted-foreground text-xs">
                                                            {schedule.scheduled_date
                                                                ? new Date(schedule.scheduled_date).toLocaleDateString('id-ID', {
                                                                      day: '2-digit',
                                                                      month: 'short',
                                                                  })
                                                                : '-'}
                                                        </p>
                                                        {schedule.is_overdue && (
                                                            <Badge variant="destructive" className="mt-1 text-[10px]">
                                                                Terlambat
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
