import PaginationFooter from '@/components/pagination-footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useFlashToast } from '@/hooks/use-flash-toast';
import DriverLayout from '@/layouts/driver-layout';
import { type EquipmentRequest, type Paginated } from '@/types';
import { Head, Link } from '@inertiajs/react';

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

interface DriverEquipmentRequestsIndexProps {
    equipmentRequests: Paginated<EquipmentRequest>;
}

export default function DriverEquipmentRequestsIndex({ equipmentRequests }: DriverEquipmentRequestsIndexProps) {
    useFlashToast();

    return (
        <DriverLayout>
            <Head title="Pengajuan Alat Dapur" />

            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h1 className="text-xl font-semibold">Pengajuan Alat Dapur</h1>
                <Button asChild className="shrink-0">
                    <Link href={route('driver.equipment-requests.create')}>Buat Pengajuan</Link>
                </Button>
            </div>

            <div className="space-y-3">
                {equipmentRequests.data.length === 0 && (
                    <Card>
                        <CardContent className="py-8 text-center text-sm text-muted-foreground">Belum ada pengajuan yang dikirim.</CardContent>
                    </Card>
                )}

                {equipmentRequests.data.map((request) => (
                    <Card key={request.id}>
                        <CardContent className="flex items-start justify-between gap-3 p-4">
                            <div className="min-w-0">
                                <p className="truncate font-medium">{itemLabel(request)}</p>
                                <p className="text-sm text-muted-foreground">Jumlah: {request.quantity}</p>
                                <p className="truncate text-sm text-muted-foreground">{request.reason}</p>
                                {request.review_note && (
                                    <p className="mt-1 text-sm break-words text-muted-foreground">Catatan: {request.review_note}</p>
                                )}
                            </div>
                            <Badge variant={statusBadgeVariant(request.status)} className="shrink-0">
                                {STATUS_LABELS[request.status]}
                            </Badge>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="mt-4">
                <PaginationFooter paginated={equipmentRequests} />
            </div>
        </DriverLayout>
    );
}
