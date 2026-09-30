import PaginationFooter from '@/components/pagination-footer';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useFlashToast } from '@/hooks/use-flash-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Paginated, type User, type Vehicle, type VehicleUsageLog } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import Swal from 'sweetalert2';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Kendaraan', href: '/vehicles' },
    { title: 'Riwayat Pemakaian', href: '/vehicles/usage-logs' },
];

interface UsageLogsIndexProps {
    usageLogs: Paginated<VehicleUsageLog>;
    vehicles: Vehicle[];
    drivers: User[];
    filters: { vehicle_id?: string; driver_id?: string };
}

export default function UsageLogsIndex({ usageLogs, vehicles, drivers, filters }: UsageLogsIndexProps) {
    useFlashToast();

    function updateFilter(key: 'vehicle_id' | 'driver_id', value: string) {
        router.get(
            route('vehicles.usage-logs.index'),
            { ...filters, [key]: value === 'all' ? undefined : value },
            { preserveState: true, replace: true },
        );
    }

    async function handleDelete(usageLog: VehicleUsageLog) {
        const confirmation = await Swal.fire({
            icon: 'warning',
            title: 'Hapus riwayat pemakaian ini?',
            text: 'Tindakan ini tidak bisa dibatalkan.',
            showCancelButton: true,
            confirmButtonText: 'Ya, hapus',
            cancelButtonText: 'Batal',
        });

        if (confirmation.isConfirmed) {
            router.delete(route('vehicles.usage-logs.destroy', usageLog.id));
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Riwayat Pemakaian Kendaraan" />

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

                        <Select value={filters.driver_id ?? 'all'} onValueChange={(value) => updateFilter('driver_id', value)}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Semua Sopir" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Sopir</SelectItem>
                                {drivers.map((driver) => (
                                    <SelectItem key={driver.id} value={String(driver.id)}>
                                        {driver.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button asChild>
                        <Link href={route('vehicles.usage-logs.create')}>Catat Pemakaian</Link>
                    </Button>
                </div>

                <div className="rounded-xl border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Kendaraan</TableHead>
                                <TableHead>Sopir</TableHead>
                                <TableHead>Dapur</TableHead>
                                <TableHead>Tujuan</TableHead>
                                <TableHead className="text-right">Jarak (km)</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {usageLogs.data.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell>{new Date(log.usage_date).toLocaleDateString('id-ID')}</TableCell>
                                    <TableCell className="font-medium">{log.vehicle.plate_number}</TableCell>
                                    <TableCell>{log.driver.name}</TableCell>
                                    <TableCell>{log.kitchen?.name ?? '-'}</TableCell>
                                    <TableCell>{log.destination ?? '-'}</TableCell>
                                    <TableCell className="text-right">
                                        {log.start_odometer !== null && log.end_odometer !== null
                                            ? log.end_odometer - log.start_odometer
                                            : '-'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button size="sm" variant="outline" asChild>
                                                <Link href={route('vehicles.usage-logs.edit', log.id)}>Ubah</Link>
                                            </Button>
                                            <Button size="sm" variant="destructive" onClick={() => handleDelete(log)}>
                                                Hapus
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <PaginationFooter paginated={usageLogs} />
            </div>
        </AppLayout>
    );
}
