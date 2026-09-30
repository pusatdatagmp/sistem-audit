import PaginationFooter from '@/components/pagination-footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useFlashToast } from '@/hooks/use-flash-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type ComplaintTicket, type MasterDataOption, type Paginated } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Tiket Pengaduan', href: '/tickets' }];

const STATUS_LABELS: Record<string, string> = {
    open: 'Open',
    in_progress: 'In Progress',
    resolved: 'Resolved',
};

function statusBadgeVariant(status: string): 'default' | 'outline' | 'destructive' {
    if (status === 'resolved') {
        return 'default';
    }

    if (status === 'in_progress') {
        return 'outline';
    }

    return 'destructive';
}

interface TicketsIndexProps {
    tickets: Paginated<ComplaintTicket>;
    categoryOptions: MasterDataOption[];
    priorityOptions: MasterDataOption[];
    filters: { status?: string; priority_option_id?: string; category_option_id?: string; search?: string };
}

export default function TicketsIndex({ tickets, categoryOptions, priorityOptions, filters }: TicketsIndexProps) {
    useFlashToast();

    const [search, setSearch] = useState(filters.search ?? '');

    function updateFilter(key: keyof TicketsIndexProps['filters'], value: string) {
        router.get(route('tickets.index'), { ...filters, [key]: value === 'all' ? undefined : value }, { preserveState: true, replace: true });
    }

    useEffect(() => {
        if (search === (filters.search ?? '')) {
            return;
        }

        const timeout = setTimeout(() => {
            router.get(route('tickets.index'), { ...filters, search: search || undefined }, { preserveState: true, replace: true });
        }, 400);

        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tiket Pengaduan" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap gap-2">
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nomor tiket/subjek..."
                            className="w-56"
                        />

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

                        <Select value={filters.priority_option_id ?? 'all'} onValueChange={(value) => updateFilter('priority_option_id', value)}>
                            <SelectTrigger className="w-40">
                                <SelectValue placeholder="Semua Prioritas" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Prioritas</SelectItem>
                                {priorityOptions.map((option) => (
                                    <SelectItem key={option.id} value={String(option.id)}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button asChild>
                        <Link href={route('tickets.create')}>Buat Tiket</Link>
                    </Button>
                </div>

                <div className="rounded-xl border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>No. Tiket</TableHead>
                                <TableHead>Subjek</TableHead>
                                <TableHead>Kategori</TableHead>
                                <TableHead>Prioritas</TableHead>
                                <TableHead>Pelapor</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tickets.data.map((ticket) => (
                                <TableRow key={ticket.id}>
                                    <TableCell className="font-mono text-xs">{ticket.ticket_number}</TableCell>
                                    <TableCell className="max-w-xs truncate">{ticket.subject}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{ticket.category.label}</Badge>
                                    </TableCell>
                                    <TableCell>{ticket.priority.label}</TableCell>
                                    <TableCell>{ticket.reporter.name}</TableCell>
                                    <TableCell>
                                        <Badge variant={statusBadgeVariant(ticket.status)}>{STATUS_LABELS[ticket.status]}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm" variant="outline" asChild>
                                            <Link href={route('tickets.show', ticket.id)}>Detail</Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <PaginationFooter paginated={tickets} />
            </div>
        </AppLayout>
    );
}
