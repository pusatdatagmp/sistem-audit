import PaginationFooter from '@/components/pagination-footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useFlashToast } from '@/hooks/use-flash-toast';
import AppLayout from '@/layouts/app-layout';
import OpnameDialog from '@/pages/inventory/components/opname-dialog';
import StockMutationDialog from '@/pages/inventory/components/stock-mutation-dialog';
import TransferDialog from '@/pages/inventory/components/transfer-dialog';
import { type BreadcrumbItem, type Kitchen, type KitchenInventory, type KitchenTool, type MasterDataOption, type Paginated } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Inventaris Dapur', href: '/inventory' }];

const SORT_OPTIONS = [
    { value: 'kitchen_asc', label: 'Dapur (A-Z)' },
    { value: 'kitchen_desc', label: 'Dapur (Z-A)' },
    { value: 'tool_asc', label: 'Nama Alat (A-Z)' },
    { value: 'tool_desc', label: 'Nama Alat (Z-A)' },
    { value: 'total_desc', label: 'Total Stok (Tertinggi)' },
    { value: 'total_asc', label: 'Total Stok (Terendah)' },
];

interface InventoryFilters {
    kitchen_id?: string;
    category_option_id?: string;
    search?: string;
    sort?: string;
}

interface InventoryIndexProps {
    inventories: Paginated<KitchenInventory>;
    kitchens: Kitchen[];
    kitchenTools: KitchenTool[];
    categoryOptions: MasterDataOption[];
    conditionOptions: MasterDataOption[];
    filters: InventoryFilters;
}

type DialogMode = 'in' | 'out' | 'transfer' | 'opname' | null;

export default function InventoryIndex({ inventories, kitchens, categoryOptions, conditionOptions, filters }: InventoryIndexProps) {
    useFlashToast();

    const [dialogMode, setDialogMode] = useState<DialogMode>(null);
    const [activeInventory, setActiveInventory] = useState<KitchenInventory | null>(null);
    const [search, setSearch] = useState(filters.search ?? '');

    function openDialog(mode: DialogMode, inventory: KitchenInventory) {
        setActiveInventory(inventory);
        setDialogMode(mode);
    }

    function closeDialog(open: boolean) {
        if (!open) {
            setDialogMode(null);
            setActiveInventory(null);
        }
    }

    function updateFilter(key: keyof InventoryFilters, value: string) {
        router.get(route('inventory.index'), { ...filters, [key]: value === 'all' ? undefined : value }, { preserveState: true, replace: true });
    }

    useEffect(() => {
        if (search === (filters.search ?? '')) {
            return;
        }

        const timeout = setTimeout(() => {
            router.get(
                route('inventory.index'),
                { ...filters, search: search || undefined },
                { preserveState: true, replace: true },
            );
        }, 400);

        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inventaris Dapur" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-2">
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nama/kode alat atau dapur..."
                            className="w-64"
                        />

                        <Select value={filters.kitchen_id ?? 'all'} onValueChange={(value) => updateFilter('kitchen_id', value)}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Semua Dapur" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Dapur</SelectItem>
                                {kitchens.map((kitchen) => (
                                    <SelectItem key={kitchen.id} value={String(kitchen.id)}>
                                        {kitchen.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

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

                        <Select value={filters.sort ?? 'kitchen_asc'} onValueChange={(value) => updateFilter('sort', value)}>
                            <SelectTrigger className="w-56">
                                <SelectValue placeholder="Urutkan" />
                            </SelectTrigger>
                            <SelectContent>
                                {SORT_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={route('inventory.logs')}>Riwayat Mutasi</Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href={route('inventory.kitchen-tools.index')}>Kelola Alat Dapur</Link>
                        </Button>
                    </div>
                </div>

                <div className="rounded-xl border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Dapur</TableHead>
                                <TableHead>Alat</TableHead>
                                <TableHead>Kategori</TableHead>
                                <TableHead className="text-right">Baik</TableHead>
                                <TableHead className="text-right">Perlu Perbaikan</TableHead>
                                <TableHead className="text-right">Rusak Berat</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence initial={false}>
                                {inventories.data.map((inventory) => (
                                    <motion.tr
                                        key={inventory.id}
                                        layout
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="border-b transition-colors hover:bg-muted/50"
                                    >
                                        <TableCell>{inventory.kitchen.name}</TableCell>
                                        <TableCell>{inventory.kitchen_tool.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{inventory.kitchen_tool.category?.label ?? '-'}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">{inventory.quantity_good}</TableCell>
                                        <TableCell className="text-right">{inventory.quantity_needs_repair}</TableCell>
                                        <TableCell className="text-right">{inventory.quantity_damaged}</TableCell>
                                        <TableCell className="text-right font-medium">
                                            {inventory.quantity_good + inventory.quantity_needs_repair + inventory.quantity_damaged}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button size="sm" variant="outline" onClick={() => openDialog('in', inventory)}>
                                                    Masuk
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => openDialog('out', inventory)}>
                                                    Keluar
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => openDialog('transfer', inventory)}>
                                                    Transfer
                                                </Button>
                                                <Button className='bg-primary text-white cursor-pointer duration-300' size="sm" variant="outline" onClick={() => openDialog('opname', inventory)}>
                                                    Opname
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </TableBody>
                    </Table>
                </div>

                <PaginationFooter paginated={inventories} />
            </div>

            <StockMutationDialog
                mode={dialogMode === 'out' ? 'out' : 'in'}
                inventory={activeInventory}
                conditionOptions={conditionOptions}
                open={dialogMode === 'in' || dialogMode === 'out'}
                onOpenChange={closeDialog}
            />

            <TransferDialog
                inventory={activeInventory}
                kitchens={kitchens}
                conditionOptions={conditionOptions}
                open={dialogMode === 'transfer'}
                onOpenChange={closeDialog}
            />

            <OpnameDialog inventory={activeInventory} open={dialogMode === 'opname'} onOpenChange={closeDialog} />
        </AppLayout>
    );
}
