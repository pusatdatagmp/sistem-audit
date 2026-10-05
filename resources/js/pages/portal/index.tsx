import PaginationFooter from '@/components/pagination-footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useFlashToast } from '@/hooks/use-flash-toast';
import PortalLayout from '@/layouts/portal-layout';
import { type ComplaintTicket, type Paginated } from '@/types';
import { Head, Link } from '@inertiajs/react';

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

interface PortalIndexProps {
    tickets: Paginated<ComplaintTicket>;
}

export default function PortalIndex({ tickets }: PortalIndexProps) {
    useFlashToast();

    return (
        <PortalLayout>
            <Head title="Laporan Saya" />

            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h1 className="text-xl font-semibold">Laporan Saya</h1>
                <Button asChild className="shrink-0">
                    <Link href={route('portal.create')}>Buat Laporan</Link>
                </Button>
            </div>

            <div className="space-y-3">
                {tickets.data.length === 0 && (
                    <Card>
                        <CardContent className="py-8 text-center text-sm text-muted-foreground">
                            Belum ada laporan yang dikirim.
                        </CardContent>
                    </Card>
                )}

                {tickets.data.map((ticket) => (
                    <Link key={ticket.id} href={route('portal.show', ticket.id)}>
                        <Card className="transition-colors hover:bg-muted/50">
                            <CardContent className="flex items-start justify-between gap-3 p-4">
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-mono text-xs text-muted-foreground">{ticket.ticket_number}</p>
                                    <p className="truncate font-medium">{ticket.subject}</p>
                                    <p className="truncate text-sm text-muted-foreground">
                                        {ticket.category.label} &middot; {ticket.priority.label}
                                    </p>
                                </div>
                                <Badge variant={statusBadgeVariant(ticket.status)} className="shrink-0">
                                    {STATUS_LABELS[ticket.status]}
                                </Badge>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            <div className="mt-4">
                <PaginationFooter paginated={tickets} />
            </div>
        </PortalLayout>
    );
}
