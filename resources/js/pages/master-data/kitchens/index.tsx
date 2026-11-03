import PaginationFooter from '@/components/pagination-footer';
import SortableHeader from '@/components/sortable-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useFlashToast } from '@/hooks/use-flash-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Kitchen, type Paginated } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Master Data', href: '/master-data/kitchens' }, { title: 'Dapur', href: '/master-data/kitchens' }];

interface KitchensFilters {
    is_active?: string;
    search?: string;
    sort?: string | null;
    direction?: 'asc' | 'desc' | null;
}

interface KitchensIndexProps {
    kitchens: Paginated<Kitchen>;
    filters: KitchensFilters;
}

export default function KitchensIndex({ kitchens, filters }: KitchensIndexProps) {
    useFlashToast();

    const [search, setSearch] = useState(filters.search ?? '');

    function updateFilter(key: keyof KitchensFilters, value: string) {
        router.get(
            route('master-data.kitchens.index'),
            { ...filters, [key]: value === 'all' ? undefined : value },
            { preserveState: true, replace: true },
        );
    }

    useEffect(() => {
        if (search === (filters.search ?? '')) {
            return;
        }

        const timeout = setTimeout(() => {
            router.get(route('master-data.kitchens.index'), { ...filters, search: search || undefined }, { preserveState: true, replace: true });
        }, 400);

        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    async function handleDelete(kitchen: Kitchen) {
        const confirmation = await Swal.fire({
            icon: 'warning',
            title: `Hapus ${kitchen.name}?`,
            text: 'Tindakan ini tidak bisa dibatalkan.',
            showCancelButton: true,
            confirmButtonText: 'Ya, hapus',
            cancelButtonText: 'Batal',
        });

        if (confirmation.isConfirmed) {
            router.delete(route('master-data.kitchens.destroy', kitchen.id));
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dapur" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h1 className="text-xl font-semibold">Dapur</h1>
                    <Button asChild className="shrink-0">
                        <Link href={route('master-data.kitchens.create')}>Tambah Dapur</Link>
                    </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama/kode/PIC..." className="w-56" />

                    <Select value={filters.is_active ?? 'all'} onValueChange={(value) => updateFilter('is_active', value)}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Semua Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            <SelectItem value="1">Aktif</SelectItem>
                            <SelectItem value="0">Nonaktif</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="rounded-xl border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>No</TableHead>
                                <SortableHeader label="Kode" sortKey="code" routeName="master-data.kitchens.index" filters={filters} />
                                <SortableHeader label="Nama" sortKey="name" routeName="master-data.kitchens.index" filters={filters} />
                                <SortableHeader label="PIC" sortKey="pic_name" routeName="master-data.kitchens.index" filters={filters} />
                                <SortableHeader label="Telepon" sortKey="phone" routeName="master-data.kitchens.index" filters={filters} />
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {kitchens.data.map((kitchen, index) => (
                                <TableRow key={kitchen.id}>
                                    <TableCell>{(kitchens.from ?? 1) + index}</TableCell>
                                    <TableCell>{kitchen.code}</TableCell>
                                    <TableCell>{kitchen.name}</TableCell>
                                    <TableCell>{kitchen.pic_name ?? '-'}</TableCell>
                                    <TableCell>{kitchen.phone ?? '-'}</TableCell>
                                    <TableCell>
                                        <Badge variant={kitchen.is_active ? 'default' : 'outline'}>
                                            {kitchen.is_active ? 'Aktif' : 'Nonaktif'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button size="sm" variant="outline" asChild>
                                                <Link href={route('master-data.kitchens.edit', kitchen.id)}>Ubah</Link>
                                            </Button>
                                            <Button size="sm" variant="destructive" onClick={() => handleDelete(kitchen)}>
                                                Hapus
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <PaginationFooter paginated={kitchens} />
            </div>
        </AppLayout>
    );
}
