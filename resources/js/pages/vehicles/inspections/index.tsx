import PaginationFooter from '@/components/pagination-footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useFlashToast } from '@/hooks/use-flash-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Paginated, type Vehicle, type VehicleInspection } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import Swal from 'sweetalert2';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Kendaraan', href: '/vehicles' },
    { title: 'Inspeksi Komponen', href: '/vehicles/inspections' },
];

interface InspectionsIndexProps {
    inspections: Paginated<VehicleInspection>;
    vehicles: Vehicle[];
    filters: { vehicle_id?: string };
}

function worstConditionBadge(inspection: VehicleInspection) {
    const codes = inspection.items.map((item) => item.condition.code);

    if (codes.includes('rusak-berat')) {
        return <Badge variant="destructive">Ada Rusak Berat</Badge>;
    }

    if (codes.includes('perlu-perbaikan')) {
        return <Badge variant="outline">Perlu Perbaikan</Badge>;
    }

    return <Badge variant="default">Semua Baik</Badge>;
}

export default function InspectionsIndex({ inspections, vehicles, filters }: InspectionsIndexProps) {
    useFlashToast();

    function updateFilter(value: string) {
        router.get(
            route('vehicles.inspections.index'),
            { ...filters, vehicle_id: value === 'all' ? undefined : value },
            { preserveState: true, replace: true },
        );
    }

    async function handleDelete(inspection: VehicleInspection) {
        const confirmation = await Swal.fire({
            icon: 'warning',
            title: 'Hapus inspeksi ini?',
            text: 'Tindakan ini tidak bisa dibatalkan.',
            showCancelButton: true,
            confirmButtonText: 'Ya, hapus',
            cancelButtonText: 'Batal',
        });

        if (confirmation.isConfirmed) {
            router.delete(route('vehicles.inspections.destroy', inspection.id));
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inspeksi Komponen Kendaraan" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-2">
                        <Select value={filters.vehicle_id ?? 'all'} onValueChange={updateFilter}>
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
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" asChild>
                            <Link href={route('master-data.option-groups.show', 'vehicle_component')}>Kelola Komponen</Link>
                        </Button>
                        <Button asChild>
                            <Link href={route('vehicles.inspections.create')}>Catat Inspeksi</Link>
                        </Button>
                    </div>
                </div>

                <div className="rounded-xl border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Kendaraan</TableHead>
                                <TableHead>Odometer</TableHead>
                                <TableHead>Diperiksa Oleh</TableHead>
                                <TableHead>Ringkasan</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {inspections.data.map((inspection) => (
                                <TableRow key={inspection.id}>
                                    <TableCell>{new Date(inspection.inspected_at).toLocaleString('id-ID')}</TableCell>
                                    <TableCell className="font-medium">{inspection.vehicle.plate_number}</TableCell>
                                    <TableCell>{inspection.odometer ?? '-'}</TableCell>
                                    <TableCell>{inspection.inspected_by.name}</TableCell>
                                    <TableCell>{worstConditionBadge(inspection)}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button size="sm" variant="outline" asChild>
                                                <Link href={route('vehicles.inspections.show', inspection.id)}>Detail</Link>
                                            </Button>
                                            <Button size="sm" variant="destructive" onClick={() => handleDelete(inspection)}>
                                                Hapus
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <PaginationFooter paginated={inspections} />
            </div>
        </AppLayout>
    );
}
