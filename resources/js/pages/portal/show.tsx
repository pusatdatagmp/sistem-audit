import { Badge } from '@/components/ui/badge';
import { useFlashToast } from '@/hooks/use-flash-toast';
import PortalLayout from '@/layouts/portal-layout';
import { type ComplaintTicket } from '@/types';
import { Head } from '@inertiajs/react';

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

interface PortalShowProps {
    ticket: ComplaintTicket;
}

export default function PortalShow({ ticket }: PortalShowProps) {
    useFlashToast();

    return (
        <PortalLayout>
            <Head title={`Laporan ${ticket.ticket_number}`} />

            <div className="space-y-4">
                <div className="bg-background rounded-xl border p-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-muted-foreground font-mono text-xs">{ticket.ticket_number}</p>
                            <h1 className="text-xl font-semibold">{ticket.subject}</h1>
                        </div>
                        <Badge variant={statusBadgeVariant(ticket.status)}>{STATUS_LABELS[ticket.status]}</Badge>
                    </div>

                    <p className="mt-4 text-sm whitespace-pre-wrap">{ticket.description}</p>

                    {ticket.photo_url && (
                        <a href={ticket.photo_url} target="_blank" rel="noopener noreferrer" className="mt-4 block w-fit">
                            <img src={ticket.photo_url} alt="Foto bukti laporan" className="max-h-64 rounded-lg border object-contain" />
                        </a>
                    )}

                    <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <dt className="text-muted-foreground">Kategori</dt>
                            <dd>{ticket.category.label}</dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground">Prioritas</dt>
                            <dd>{ticket.priority.label}</dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground">Dapur</dt>
                            <dd>{ticket.kitchen?.name ?? '-'}</dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground">Ditugaskan Kepada</dt>
                            <dd>{ticket.assigned_to?.name ?? 'Belum ditugaskan'}</dd>
                        </div>
                    </dl>
                </div>

                <div className="bg-background rounded-xl border p-4">
                    <h2 className="mb-3 font-semibold">Riwayat Penanganan</h2>
                    <div className="space-y-3">
                        {ticket.updates && ticket.updates.length > 0 ? (
                            ticket.updates.map((update) => (
                                <div key={update.id} className="border-muted border-l-2 pl-3 text-sm">
                                    <p className="text-muted-foreground font-medium">
                                        {update.status_from ? `${STATUS_LABELS[update.status_from]} → ` : ''}
                                        {update.status_to ? STATUS_LABELS[update.status_to] : ''}
                                    </p>
                                    {update.note && <p>{update.note}</p>}
                                    <p className="text-muted-foreground text-xs">{new Date(update.created_at).toLocaleString('id-ID')}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted-foreground text-sm">Laporan Anda sedang menunggu ditinjau.</p>
                        )}
                    </div>
                </div>
            </div>
        </PortalLayout>
    );
}
