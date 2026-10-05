import PaginationFooter from '@/components/pagination-footer';
import SortableHeader from '@/components/sortable-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useFlashToast } from '@/hooks/use-flash-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type KitchenTool, type MasterDataOption, type Paginated } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Inventaris Dapur', href: '/inventory' },
    { title: 'Alat Dapur', href: '/inventory/kitchen-tools' },
];

interface KitchenToolsFilters {
    category_option_id?: string;
    is_active?: string;
    search?: string;
    sort?: string | null;
    direction?: 'asc' | 'desc' | null;
}

interface KitchenToolsIndexProps {
    kitchenTools: Paginated<KitchenTool>;
    categoryOptions: MasterDataOption[];
    filters: KitchenToolsFilters;
}

export default function KitchenToolsIndex({ kitchenTools, categoryOptions, filters }: KitchenToolsIndexProps) {
    useFlashToast();

    const [search, setSearch] = useState(filters.search ?? '');

    function updateFilter(key: keyof KitchenToolsFilters, value: string) {
        router.get(
            route('inventory.kitchen-tools.index'),
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
                route('inventory.kitchen-tools.index'),
                { ...filters, search: search || undefined },
                { preserveState: true, replace: true },
            );
        }, 400);

        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    async function handleDelete(tool: KitchenTool) {
        const confirmation = await Swal.fire({
            icon: 'warning',
            title: `Hapus ${tool.name}?`,
            text: 'Tindakan ini tidak bisa dibatalkan.',
            showCancelButton: true,
            confirmButtonText: 'Ya, hapus',
            cancelButtonText: 'Batal',
        });

        if (confirmation.isConfirmed) {
            router.delete(route('inventory.kitchen-tools.destroy', tool.id));
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Alat Dapur" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h1 className="text-xl font-semibold">Alat Dapur</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={route('master-data.option-groups.show', 'kitchen_tool_category')}>Kelola Kategori</Link>
                        </Button>
                        <Button asChild>
                            <Link href={route('inventory.kitchen-tools.create')}>Tambah Alat</Link>
                        </Button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama/kode alat..." className="w-56" />

                    <Select value={filters.category_option_id ?? 'all'} onValueChange={(value) => updateFilter('category_option_id', value)}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Semua Kategori" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Kategori</SelectItem>
                            {categoryOptions.map((option) => (
                                <SelectItem key={option.id} value={String(option.id)}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

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
                                <SortableHeader label="Kode" sortKey="code" routeName="inventory.kitchen-tools.index" filters={filters} />
                                <SortableHeader label="Nama" sortKey="name" routeName="inventory.kitchen-tools.index" filters={filters} />
                                <SortableHeader label="Satuan" sortKey="unit" routeName="inventory.kitchen-tools.index" filters={filters} />
                                <SortableHeader label="Kategori" sortKey="category" routeName="inventory.kitchen-tools.index" filters={filters} />
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {kitchenTools.data.map((tool) => (
                                <TableRow key={tool.id}>
                                    <TableCell>{tool.code}</TableCell>
                                    <TableCell>{tool.name}</TableCell>
                                    <TableCell>{tool.unit}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{tool.category?.label ?? '-'}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={tool.is_active ? 'default' : 'outline'}>{tool.is_active ? 'Aktif' : 'Nonaktif'}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button size="sm" variant="outline" asChild>
                                                <Link href={route('inventory.kitchen-tools.edit', tool.id)}>Ubah</Link>
                                            </Button>
                                            <Button size="sm" variant="destructive" onClick={() => handleDelete(tool)}>
                                                Hapus
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <PaginationFooter paginated={kitchenTools} />
            </div>
        </AppLayout>
    );
}
