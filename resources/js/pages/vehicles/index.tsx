import PaginationFooter from '@/components/pagination-footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useFlashToast } from '@/hooks/use-flash-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type MasterDataOption, type Paginated, type Vehicle } from '@/types';
import { Head, Link, router } from '@inertiajs/react';

import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Kendaraan', href: '/vehicles' }];

interface VehiclesIndexProps {
    vehicles: Paginated<Vehicle>;
    typeOptions: MasterDataOption[];
    statusOptions: MasterDataOption[];
    filters: { status_option_id?: string; vehicle_type_option_id?: string; search?: string };
}

export default function VehiclesIndex({ vehicles, typeOptions, statusOptions, filters }: VehiclesIndexProps) {
    useFlashToast();

    const [search, setSearch] = useState(filters.search ?? '');

    function updateFilter(key: 'status_option_id' | 'vehicle_type_option_id', value: string) {
        router.get(route('vehicles.index'), { ...filters, [key]: value === 'all' ? undefined : value }, { preserveState: true, replace: true });
    }

    useEffect(() => {
        if (search === (filters.search ?? '')) {
            return;
        }

        const timeout = setTimeout(() => {
            router.get(route('vehicles.index'), { ...filters, search: search || undefined }, { preserveState: true, replace: true });
        }, 400);

        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    async function handleDelete(vehicle: Vehicle) {
        const confirmation = await Swal.fire({
            icon: 'warning',
            title: `Hapus ${vehicle.plate_number}?`,
            text: 'Tindakan ini tidak bisa dibatalkan.',
            showCancelButton: true,
            confirmButtonText: 'Ya, hapus',
            cancelButtonText: 'Batal',
        });

        if (confirmation.isConfirmed) {
            router.delete(route('vehicles.destroy', vehicle.id));
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kendaraan" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-2">
                        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari plat/merek/model..." className="w-56" />

                        <Select value={filters.vehicle_type_option_id ?? 'all'} onValueChange={(value) => updateFilter('vehicle_type_option_id', value)}>
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
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button asChild>
                            <Link href={route('vehicles.create')}>Tambah Kendaraan</Link>
                        </Button>
                    </div>
                </div>

                <div className="rounded-xl border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Plat Nomor</TableHead>
                                <TableHead>Jenis</TableHead>
                                <TableHead>Merek/Model</TableHead>
                                <TableHead>Dapur Home Base</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {vehicles.data.map((vehicle) => (
                                <TableRow key={vehicle.id}>
                                    <TableCell className="font-medium">{vehicle.plate_number}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{vehicle.vehicle_type?.label ?? '-'}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        {vehicle.brand} {vehicle.model} {vehicle.year ? `(${vehicle.year})` : ''}
                                    </TableCell>
                                    <TableCell>{vehicle.home_kitchen?.name ?? '-'}</TableCell>
                                    <TableCell>
                                        <Badge variant={vehicle.is_active ? 'default' : 'outline'}>{vehicle.status?.label ?? '-'}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button size="sm" variant="outline" asChild>
                                                <Link href={route('vehicles.edit', vehicle.id)}>Ubah</Link>
                                            </Button>
                                            <Button size="sm" variant="destructive" onClick={() => handleDelete(vehicle)}>
                                                Hapus
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <PaginationFooter paginated={vehicles} />
            </div>
        </AppLayout>
    );
}
