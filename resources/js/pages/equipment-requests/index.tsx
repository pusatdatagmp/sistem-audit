import PaginationFooter from '@/components/pagination-footer';
import SortableHeader from '@/components/sortable-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useFlashToast } from '@/hooks/use-flash-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type EquipmentRequest, type Kitchen, type Paginated } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Pengajuan Alat Dapur', href: '/equipment-requests' }];

const STATUS_LABELS: Record<string, string> = {
    pending: 'Menunggu',
    approved: 'Disetujui',
    rejected: 'Ditolak',
};

function statusBadgeVariant(status: string): 'default' | 'outline' | 'destructive' {
    if (status === 'approved') {
        return 'default';
    }

    if (status === 'rejected') {
        return 'destructive';
    }

    return 'outline';
}

function itemLabel(request: EquipmentRequest): string {
    return request.kitchen_tool ? request.kitchen_tool.name : `Alat baru: ${request.new_tool_name}`;
}

interface EquipmentRequestsFilters {
    status?: string;
    kitchen_id?: string;
    search?: string;
    sort?: string | null;
    direction?: 'asc' | 'desc' | null;
}

interface EquipmentRequestsIndexProps {
    equipmentRequests: Paginated<EquipmentRequest>;
    kitchens: Kitchen[];
    filters: EquipmentRequestsFilters;
}

export default function EquipmentRequestsIndex({ equipmentRequests, kitchens, filters }: EquipmentRequestsIndexProps) {
    useFlashToast();

    const [search, setSearch] = useState(filters.search ?? '');

    function updateFilter(key: keyof EquipmentRequestsFilters, value: string) {
        router.get(
            route('equipment-requests.index'),
            { ...filters, [key]: value === 'all' ? undefined : value },
            { preserveState: true, replace: true },
        );
    }

    useEffect(() => {
        if (search === (filters.search ?? '')) {
            return;
        }

        const timeout = setTimeout(() => {
            router.get(route('equipment-requests.index'), { ...filters, search: search || undefined }, { preserveState: true, replace: true });
        }, 400);

        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    async function handleApprove(request: EquipmentRequest) {
        const confirmation = await Swal.fire({
            icon: 'question',
            title: `Setujui pengajuan ${itemLabel(request)}?`,
            text: 'Stok akan otomatis ditambahkan ke inventaris dapur terkait.',
            showCancelButton: true,
            confirmButtonText: 'Ya, setujui',
            cancelButtonText: 'Batal',
        });

        if (!confirmation.isConfirmed) {
            return;
        }

        router.post(
            route('equipment-requests.update-status', request.id),
            { status: 'approved' },
            {
                preserveScroll: true,
                onError: (errors) => {
                    Swal.fire({ icon: 'error', title: 'Gagal menyetujui pengajuan', text: errors.status });
                },
            },
        );
    }

    async function handleReject(request: EquipmentRequest) {
        const { value: note, isConfirmed } = await Swal.fire({
            icon: 'warning',
            title: `Tolak pengajuan ${itemLabel(request)}?`,
            input: 'textarea',
            inputPlaceholder: 'Alasan penolakan...',
            showCancelButton: true,
            confirmButtonText: 'Ya, tolak',
            cancelButtonText: 'Batal',
            inputValidator: (value) => (!value ? 'Alasan penolakan wajib diisi.' : undefined),
        });

        if (!isConfirmed) {
            return;
        }

        router.post(
            route('equipment-requests.update-status', request.id),
            { status: 'rejected', note },
            {
                preserveScroll: true,
                onError: (errors) => {
                    Swal.fire({ icon: 'error', title: 'Gagal menolak pengajuan', text: errors.status ?? errors.note });
                },
            },
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengajuan Alat Dapur" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h1 className="text-xl font-semibold">Pengajuan Alat Dapur</h1>
                    <Button asChild className="shrink-0">
                        <Link href={route('equipment-requests.create')}>Buat Pengajuan</Link>
                    </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari pemohon/alat..." className="w-56" />

                    <Select value={filters.status ?? 'all'} onValueChange={(value) => updateFilter('status', value)}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Semua Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua Status</SelectItem>
                            {Object.entries(STATUS_LABELS).map(([value, label]) => (
                                <SelectItem key={value} value={value}>
                                    {label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

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
                </div>

                <div className="rounded-xl border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <SortableHeader label="Dapur" sortKey="kitchen" routeName="equipment-requests.index" filters={filters} />
                                <TableHead>Item</TableHead>
                                <SortableHeader
                                    label="Jumlah"
                                    sortKey="quantity"
                                    routeName="equipment-requests.index"
                                    filters={filters}
                                    className="text-right"
                                />
                                <SortableHeader label="Pemohon" sortKey="requested_by" routeName="equipment-requests.index" filters={filters} />
                                <TableHead>Alasan</TableHead>
                                <SortableHeader label="Status" sortKey="status" routeName="equipment-requests.index" filters={filters} />
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {equipmentRequests.data.map((request) => (
                                <TableRow key={request.id}>
                                    <TableCell>{request.kitchen.name}</TableCell>
                                    <TableCell>{itemLabel(request)}</TableCell>
                                    <TableCell className="text-right">{request.quantity}</TableCell>
                                    <TableCell>{request.requested_by.name}</TableCell>
                                    <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                                    <TableCell>
                                        <Badge variant={statusBadgeVariant(request.status)}>{STATUS_LABELS[request.status]}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {request.status === 'pending' ? (
                                            <div className="flex justify-end gap-1">
                                                <Button size="sm" variant="outline" onClick={() => handleApprove(request)}>
                                                    Setujui
                                                </Button>
                                                <Button size="sm" variant="destructive" onClick={() => handleReject(request)}>
                                                    Tolak
                                                </Button>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">
                                                {request.reviewed_by ? `oleh ${request.reviewed_by.name}` : '-'}
                                            </span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <PaginationFooter paginated={equipmentRequests} />
            </div>
        </AppLayout>
    );
}
