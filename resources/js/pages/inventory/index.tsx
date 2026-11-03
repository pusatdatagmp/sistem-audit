import PaginationFooter from '@/components/pagination-footer';
import SortableHeader from '@/components/sortable-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
import { MoreHorizontal } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Inventaris Dapur', href: '/inventory' }];

interface InventoryFilters {
    kitchen_id?: string;
    category_option_id?: string;
    search?: string;
    sort?: string | null;
    direction?: 'asc' | 'desc' | null;
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
                                <TableHead>No</TableHead>
                                <SortableHeader label="Dapur" sortKey="kitchen" routeName="inventory.index" filters={filters} />
                                <SortableHeader label="Alat" sortKey="tool" routeName="inventory.index" filters={filters} />
                                <TableHead>Kategori</TableHead>
                                <SortableHeader
                                    label="Baik"
                                    sortKey="good"
                                    routeName="inventory.index"
                                    filters={filters}
                                    className="text-right"
                                />
                                <SortableHeader
                                    label="Perlu Perbaikan"
                                    sortKey="needs_repair"
                                    routeName="inventory.index"
                                    filters={filters}
                                    className="text-right"
                                />
                                <SortableHeader
                                    label="Rusak Berat"
                                    sortKey="damaged"
                                    routeName="inventory.index"
                                    filters={filters}
                                    className="text-right"
                                />
                                <SortableHeader label="Total" sortKey="total" routeName="inventory.index" filters={filters} className="text-right" />
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <AnimatePresence initial={false}>
                                {inventories.data.map((inventory, index) => (
                                    <motion.tr
                                        key={inventory.id}
                                        layout
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="border-b transition-colors hover:bg-muted/50"
                                    >
                                        <TableCell>{(inventories.from ?? 1) + index}</TableCell>
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
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button size="sm" variant="outline">
                                                        Aksi
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => openDialog('in', inventory)}>Masuk</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => openDialog('out', inventory)}>Keluar</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => openDialog('transfer', inventory)}>Transfer</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => openDialog('opname', inventory)}>Opname</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
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
