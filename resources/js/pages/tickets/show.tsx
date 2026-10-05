import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useFlashToast } from '@/hooks/use-flash-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type ComplaintTicket, type User } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import Swal from 'sweetalert2';

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

interface ShowTicketProps {
    ticket: ComplaintTicket;
    users: User[];
}

export default function ShowTicket({ ticket, users }: ShowTicketProps) {
    useFlashToast();

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Tiket Pengaduan', href: '/tickets' },
        { title: ticket.ticket_number, href: '#' },
    ];

    const { data, setData, post, processing, errors, reset } = useForm({
        status: ticket.status,
        assigned_to: ticket.assigned_to ? String(ticket.assigned_to.id) : '',
        note: '',
    });

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();

        if (data.status === 'resolved') {
            const confirmation = await Swal.fire({
                icon: 'question',
                title: 'Tandai tiket ini sebagai Resolved?',
                showCancelButton: true,
                confirmButtonText: 'Ya, selesai',
                cancelButtonText: 'Batal',
            });

            if (!confirmation.isConfirmed) {
                return;
            }
        }

        post(route('tickets.update-status', ticket.id), {
            preserveScroll: true,
            onSuccess: () => reset('note'),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Tiket ${ticket.ticket_number}`} />

            <div className="flex flex-1 flex-col gap-4 p-4 lg:flex-row">
                <div className="flex-1 space-y-4">
                    <div className="rounded-xl border p-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-muted-foreground font-mono text-xs">{ticket.ticket_number}</p>
                                <h1 className="text-xl font-semibold">{ticket.subject}</h1>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant={statusBadgeVariant(ticket.status)}>{STATUS_LABELS[ticket.status]}</Badge>
                                <Button size="sm" variant="outline" asChild>
                                    <Link href={route('tickets.edit', ticket.id)}>Ubah</Link>
                                </Button>
                            </div>
                        </div>

                        <p className="mt-4 text-sm whitespace-pre-wrap">{ticket.description}</p>

                        {ticket.photo_url && (
                            <a href={ticket.photo_url} target="_blank" rel="noopener noreferrer" className="mt-4 block w-fit">
                                <img src={ticket.photo_url} alt="Foto bukti laporan" className="max-h-64 rounded-lg border object-contain" />
                            </a>
                        )}

                        <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                            <div>
                                <dt className="text-muted-foreground">Kategori</dt>
                                <dd>{ticket.category.label}</dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">Prioritas</dt>
                                <dd>{ticket.priority.label}</dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">Pelapor</dt>
                                <dd>{ticket.reporter.name}</dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">Dapur</dt>
                                <dd>{ticket.kitchen?.name ?? '-'}</dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">Alat Dapur Terkait</dt>
                                <dd>{ticket.related_kitchen_tool?.name ?? '-'}</dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">Kendaraan Terkait</dt>
                                <dd>{ticket.related_vehicle?.plate_number ?? '-'}</dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">Ditugaskan Kepada</dt>
                                <dd>{ticket.assigned_to?.name ?? '-'}</dd>
                            </div>
                            <div>
                                <dt className="text-muted-foreground">Diselesaikan Pada</dt>
                                <dd>{ticket.resolved_at ? new Date(ticket.resolved_at).toLocaleString('id-ID') : '-'}</dd>
                            </div>
                        </dl>
                    </div>

                    <div className="rounded-xl border p-4">
                        <h2 className="mb-3 font-semibold">Riwayat Aktivitas</h2>
                        <div className="space-y-3">
                            {ticket.updates && ticket.updates.length > 0 ? (
                                ticket.updates.map((update) => (
                                    <div key={update.id} className="border-muted border-l-2 pl-3 text-sm">
                                        <p className="font-medium">
                                            {update.user.name}
                                            {update.status_to && (
                                                <span className="text-muted-foreground ml-2">
                                                    {update.status_from ? `${STATUS_LABELS[update.status_from]} → ` : ''}
                                                    {STATUS_LABELS[update.status_to]}
                                                </span>
                                            )}
                                        </p>
                                        {update.note && <p className="text-muted-foreground">{update.note}</p>}
                                        <p className="text-muted-foreground text-xs">{new Date(update.created_at).toLocaleString('id-ID')}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted-foreground text-sm">Belum ada aktivitas.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="w-full space-y-4 lg:w-80">
                    <div className="rounded-xl border p-4">
                        <h2 className="mb-3 font-semibold">Ubah Status</h2>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <Select value={data.status} onValueChange={(value) => setData('status', value as typeof data.status)}>
                                    <SelectTrigger id="status">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(STATUS_LABELS).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.status} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="assigned_to">Tugaskan Kepada (opsional)</Label>
                                <Select
                                    value={data.assigned_to || 'none'}
                                    onValueChange={(value) => setData('assigned_to', value === 'none' ? '' : value)}
                                >
                                    <SelectTrigger id="assigned_to">
                                        <SelectValue placeholder="Tidak ada" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Tidak ada</SelectItem>
                                        {users.map((user) => (
                                            <SelectItem key={user.id} value={String(user.id)}>
                                                {user.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.assigned_to} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="note">Catatan (opsional)</Label>
                                <Textarea id="note" rows={3} value={data.note} onChange={(e) => setData('note', e.target.value)} />
                                <InputError message={errors.note} />
                            </div>

                            <Button type="submit" disabled={processing} className="w-full">
                                Simpan Status
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
