import PaginationFooter from '@/components/pagination-footer';
import SortableHeader from '@/components/sortable-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useFlashToast } from '@/hooks/use-flash-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type MasterDataOption, type Paginated, type Vehicle, type VehicleMaintenanceSchedule } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import Swal from 'sweetalert2';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Kendaraan', href: '/vehicles' },
    { title: 'Jadwal Perawatan', href: '/vehicles/maintenance' },
];

interface MaintenanceFilters {
    vehicle_id?: string;
    status_option_id?: string;
    maintenance_type_option_id?: string;
    sort?: string | null;
    direction?: 'asc' | 'desc' | null;
}

interface MaintenanceIndexProps {
    schedules: Paginated<VehicleMaintenanceSchedule>;
    vehicles: Vehicle[];
    statusOptions: MasterDataOption[];
    typeOptions: MasterDataOption[];
    filters: MaintenanceFilters;
}

export default function MaintenanceIndex({ schedules, vehicles, statusOptions, typeOptions, filters }: MaintenanceIndexProps) {
    useFlashToast();

    function updateFilter(key: keyof MaintenanceFilters, value: string) {
        router.get(
            route('vehicles.maintenance.index'),
            { ...filters, [key]: value === 'all' ? undefined : value },
            { preserveState: true, replace: true },
        );
    }

    async function handleComplete(schedule: VehicleMaintenanceSchedule) {
        const confirmation = await Swal.fire({
            icon: 'question',
            title: `Tandai selesai jadwal ini?`,
            text: `${schedule.vehicle.plate_number} - ${schedule.maintenance_type?.label ?? ''}`,
            showCancelButton: true,
            confirmButtonText: 'Ya, selesai',
            cancelButtonText: 'Batal',
        });

        if (confirmation.isConfirmed) {
            router.post(route('vehicles.maintenance.complete', schedule.id), {}, { preserveScroll: true });
        }
    }

    async function handleDelete(schedule: VehicleMaintenanceSchedule) {
        const confirmation = await Swal.fire({
            icon: 'warning',
            title: 'Hapus jadwal perawatan ini?',
            text: 'Tindakan ini tidak bisa dibatalkan.',
            showCancelButton: true,
            confirmButtonText: 'Ya, hapus',
            cancelButtonText: 'Batal',
        });

        if (confirmation.isConfirmed) {
            router.delete(route('vehicles.maintenance.destroy', schedule.id));
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Jadwal Perawatan Kendaraan" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-2">
                        <Select value={filters.vehicle_id ?? 'all'} onValueChange={(value) => updateFilter('vehicle_id', value)}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Semua Kendaraan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Kendaraan</SelectItem>
                                {vehicles.map((vehicle) => (
                                    <SelectItem key={vehicle.id} value={String(vehicle.id)}>
                                        {vehicle.plate_number}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={filters.status_option_id ?? 'all'} onValueChange={(value) => updateFilter('status_option_id', value)}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Semua Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Status</SelectItem>
                                {statusOptions.map((option) => (
                                    <SelectItem key={option.id} value={String(option.id)}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={filters.maintenance_type_option_id ?? 'all'}
                            onValueChange={(value) => updateFilter('maintenance_type_option_id', value)}
                        >
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Semua Jenis" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Jenis</SelectItem>
                                {typeOptions.map((option) => (
                                    <SelectItem key={option.id} value={String(option.id)}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" asChild>
                            <Link href={route('master-data.option-groups.show', 'maintenance_type')}>Kelola Jenis</Link>
                        </Button>
                        <Button asChild>
                            <Link href={route('vehicles.maintenance.create')}>Tambah Jadwal</Link>
                        </Button>
                    </div>
                </div>

                <div className="rounded-xl border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>No</TableHead>
                                <SortableHeader label="Kendaraan" sortKey="vehicle" routeName="vehicles.maintenance.index" filters={filters} />
                                <SortableHeader
                                    label="Jenis Perawatan"
                                    sortKey="maintenance_type"
                                    routeName="vehicles.maintenance.index"
                                    filters={filters}
                                />
                                <SortableHeader
                                    label="Tanggal Jadwal"
                                    sortKey="scheduled_date"
                                    routeName="vehicles.maintenance.index"
                                    filters={filters}
                                />
                                <SortableHeader label="Status" sortKey="status" routeName="vehicles.maintenance.index" filters={filters} />
                                <SortableHeader
                                    label="Selesai Pada"
                                    sortKey="completed_at"
                                    routeName="vehicles.maintenance.index"
                                    filters={filters}
                                />
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {schedules.data.map((schedule, index) => (
                                <TableRow key={schedule.id}>
                                    <TableCell>{(schedules.from ?? 1) + index}</TableCell>
                                    <TableCell className="font-medium">{schedule.vehicle.plate_number}</TableCell>
                                    <TableCell>{schedule.maintenance_type?.label ?? '-'}</TableCell>
                                    <TableCell>{new Date(schedule.scheduled_date).toLocaleDateString('id-ID')}</TableCell>
                                    <TableCell>
                                        <Badge variant={schedule.status?.code === 'selesai' ? 'default' : 'outline'}>
                                            {schedule.status?.label ?? '-'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{schedule.completed_at ? new Date(schedule.completed_at).toLocaleDateString('id-ID') : '-'}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            {!schedule.completed_at && (
                                                <Button size="sm" variant="outline" onClick={() => handleComplete(schedule)}>
                                                    Tandai Selesai
                                                </Button>
                                            )}
                                            <Button size="sm" variant="outline" asChild>
                                                <Link href={route('vehicles.maintenance.edit', schedule.id)}>Ubah</Link>
                                            </Button>
                                            <Button size="sm" variant="destructive" onClick={() => handleDelete(schedule)}>
                                                Hapus
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <PaginationFooter paginated={schedules} />
            </div>
        </AppLayout>
    );
}
