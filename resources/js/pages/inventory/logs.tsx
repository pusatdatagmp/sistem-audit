import PaginationFooter from '@/components/pagination-footer';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type InventoryLog, type Kitchen, type KitchenTool, type Paginated } from '@/types';
import { Head, router } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Inventaris Dapur', href: '/inventory' },
    { title: 'Riwayat Mutasi', href: '/inventory/logs' },
];

const TYPE_LABELS: Record<string, string> = {
    in: 'Masuk',
    out: 'Keluar',
    transfer_in: 'Transfer Masuk',
    transfer_out: 'Transfer Keluar',
    opname: 'Opname',
};

interface LogsPageProps {
    logs: Paginated<InventoryLog>;
    kitchens: Kitchen[];
    kitchenTools: KitchenTool[];
    filters: { kitchen_id?: string; kitchen_tool_id?: string; type?: string };
}

export default function InventoryLogsIndex({ logs, kitchens, kitchenTools, filters }: LogsPageProps) {
    function updateFilter(key: keyof LogsPageProps['filters'], value: string) {
        router.get(route('inventory.logs'), { ...filters, [key]: value === 'all' ? undefined : value }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Riwayat Mutasi Inventaris" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap gap-2">
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

                    <Select value={filters.kitchen_tool_id ?? 'all'} onValueChange={(value) => updateFilter('kitchen_tool_id', value)}>
                        <SelectTrigger className="w-56">
                            <SelectValue placeholder="Semua Alat" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Alat</SelectItem>
                            {kitchenTools.map((tool) => (
                                <SelectItem key={tool.id} value={String(tool.id)}>
                                    {tool.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={filters.type ?? 'all'} onValueChange={(value) => updateFilter('type', value)}>
                        <SelectTrigger className="w-48">
                            <SelectValue placeholder="Semua Jenis" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Jenis</SelectItem>
                            {Object.entries(TYPE_LABELS).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                    {label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="rounded-xl border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tanggal</TableHead>
                                <TableHead>Dapur</TableHead>
                                <TableHead>Alat</TableHead>
                                <TableHead>Jenis</TableHead>
                                <TableHead>Kondisi</TableHead>
                                <TableHead className="text-right">Perubahan</TableHead>
                                <TableHead className="text-right">Stok Sesudah</TableHead>
                                <TableHead>Oleh</TableHead>
                                <TableHead>Catatan</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.data.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell>{new Date(log.created_at).toLocaleString('id-ID')}</TableCell>
                                    <TableCell>{log.kitchen_inventory.kitchen.name}</TableCell>
                                    <TableCell>{log.kitchen_inventory.kitchen_tool.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{TYPE_LABELS[log.type] ?? log.type}</Badge>
                                    </TableCell>
                                    <TableCell>{log.condition?.label ?? '-'}</TableCell>
                                    <TableCell className={`text-right ${log.quantity_change < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                        {log.quantity_change > 0 ? `+${log.quantity_change}` : log.quantity_change}
                                    </TableCell>
                                    <TableCell className="text-right">{log.stock_after}</TableCell>
                                    <TableCell>{log.performed_by.name}</TableCell>
                                    <TableCell className="max-w-xs truncate">{log.note ?? '-'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <PaginationFooter paginated={logs} />
            </div>
        </AppLayout>
    );
}
