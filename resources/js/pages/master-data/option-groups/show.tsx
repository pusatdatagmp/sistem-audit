import PaginationFooter from '@/components/pagination-footer';
import SortableHeader from '@/components/sortable-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useFlashToast } from '@/hooks/use-flash-toast';
import AppLayout from '@/layouts/app-layout';
import OptionFormDialog from '@/pages/master-data/option-groups/components/option-form-dialog';
import { type BreadcrumbItem, type MasterDataGroup, type MasterDataOption, type Paginated } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

interface OptionGroupShowFilters {
    is_active?: string;
    search?: string;
    sort?: string | null;
    direction?: 'asc' | 'desc' | null;
}

interface OptionGroupShowProps {
    group: MasterDataGroup;
    options: Paginated<MasterDataOption>;
    filters: OptionGroupShowFilters;
}

const PARENT_BREADCRUMBS: Record<string, BreadcrumbItem[]> = {
    kitchen_tool_category: [
        { title: 'Inventaris Dapur', href: '/inventory' },
        { title: 'Alat Dapur', href: '/inventory/kitchen-tools' },
    ],
    vehicle_type: [{ title: 'Kendaraan', href: '/vehicles' }],
    vehicle_status: [{ title: 'Kendaraan', href: '/vehicles' }],
    maintenance_type: [
        { title: 'Kendaraan', href: '/vehicles' },
        { title: 'Jadwal Perawatan', href: '/vehicles/maintenance' },
    ],
    vehicle_component: [
        { title: 'Kendaraan', href: '/vehicles' },
        { title: 'Inspeksi Komponen', href: '/vehicles/inspections' },
    ],
    complaint_category: [{ title: 'Tiket Pengaduan', href: '/tickets' }],
    ticket_priority: [{ title: 'Tiket Pengaduan', href: '/tickets' }],
};

export default function OptionGroupShow({ group, options, filters }: OptionGroupShowProps) {
    useFlashToast();

    const breadcrumbs: BreadcrumbItem[] = [
        ...(PARENT_BREADCRUMBS[group.code] ?? [
            { title: 'Master Data', href: '/master-data/kitchens' },
            { title: 'Kategori & Opsi', href: '/master-data/option-groups' },
        ]),
        { title: group.name, href: '#' },
    ];

    const [dialogOpen, setDialogOpen] = useState(false);
    const [activeOption, setActiveOption] = useState<MasterDataOption | null>(null);
    const [search, setSearch] = useState(filters.search ?? '');

    function updateFilter(key: keyof OptionGroupShowFilters, value: string) {
        router.get(
            route('master-data.option-groups.show', group.code),
            { ...filters, [key]: value === 'all' ? undefined : value },
            { preserveState: true, replace: true },
        );
    }

    useEffect(() => {
        if (search === (filters.search ?? '')) {
            return;
        }

        const timeout = setTimeout(() => {
            router.get(
                route('master-data.option-groups.show', group.code),
                { ...filters, search: search || undefined },
                { preserveState: true, replace: true },
            );
        }, 400);

        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    function openCreate() {
        setActiveOption(null);
        setDialogOpen(true);
    }

    function openEdit(option: MasterDataOption) {
        setActiveOption(option);
        setDialogOpen(true);
    }

    async function handleDelete(option: MasterDataOption) {
        const confirmation = await Swal.fire({
            icon: 'warning',
            title: `Hapus opsi ${option.label}?`,
            text: 'Tindakan ini tidak bisa dibatalkan.',
            showCancelButton: true,
            confirmButtonText: 'Ya, hapus',
            cancelButtonText: 'Batal',
        });

        if (confirmation.isConfirmed) {
            router.delete(route('master-data.options.destroy', option.id));
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Kelola Opsi - ${group.name}`} />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                        <h1 className="text-xl font-semibold">{group.name}</h1>
                        {group.description && <p className="text-sm text-muted-foreground">{group.description}</p>}
                        <p className="mt-1 font-mono text-xs text-muted-foreground">{group.code}</p>
                    </div>
                    <Button onClick={openCreate} className="shrink-0">
                        Tambah Opsi
                    </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari label/kode..." className="w-56" />

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
                                <SortableHeader
                                    label="Urutan"
                                    sortKey="sort_order"
                                    routeName="master-data.option-groups.show"
                                    routeParams={{ group: group.code }}
                                    filters={filters}
                                />
                                <SortableHeader
                                    label="Label"
                                    sortKey="label"
                                    routeName="master-data.option-groups.show"
                                    routeParams={{ group: group.code }}
                                    filters={filters}
                                />
                                <SortableHeader
                                    label="Kode"
                                    sortKey="code"
                                    routeName="master-data.option-groups.show"
                                    routeParams={{ group: group.code }}
                                    filters={filters}
                                />
                                <TableHead>Deskripsi</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {options.data.map((option, index) => (
                                <TableRow key={option.id}>
                                    <TableCell>{(options.from ?? 1) + index}</TableCell>
                                    <TableCell>{option.sort_order}</TableCell>
                                    <TableCell>{option.label}</TableCell>
                                    <TableCell className="font-mono text-xs">{option.code}</TableCell>
                                    <TableCell>{option.description ?? '-'}</TableCell>
                                    <TableCell>
                                        <Badge variant={option.is_active ? 'default' : 'outline'}>
                                            {option.is_active ? 'Aktif' : 'Nonaktif'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button size="sm" variant="outline" onClick={() => openEdit(option)}>
                                                Ubah
                                            </Button>
                                            <Button size="sm" variant="destructive" onClick={() => handleDelete(option)}>
                                                Hapus
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <PaginationFooter paginated={options} />
            </div>

            <OptionFormDialog group={group} option={activeOption} open={dialogOpen} onOpenChange={setDialogOpen} />
        </AppLayout>
    );
}
