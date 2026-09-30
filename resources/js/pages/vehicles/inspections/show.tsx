import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type VehicleInspection } from '@/types';
import { Head } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Kendaraan', href: '/vehicles' },
    { title: 'Inspeksi Komponen', href: '/vehicles/inspections' },
    { title: 'Detail', href: '#' },
];

interface ShowInspectionProps {
    inspection: VehicleInspection;
}

function conditionBadgeVariant(code: string): 'default' | 'outline' | 'destructive' {
    if (code === 'rusak-berat') {
        return 'destructive';
    }

    if (code === 'perlu-perbaikan') {
        return 'outline';
    }

    return 'default';
}

export default function ShowInspection({ inspection }: ShowInspectionProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Inspeksi - ${inspection.vehicle.plate_number}`} />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="rounded-xl border p-4">
                    <h1 className="text-xl font-semibold">{inspection.vehicle.plate_number}</h1>
                    <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
                        <div>
                            <dt className="text-muted-foreground">Tanggal Inspeksi</dt>
                            <dd>{new Date(inspection.inspected_at).toLocaleString('id-ID')}</dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground">Diperiksa Oleh</dt>
                            <dd>{inspection.inspected_by.name}</dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground">Odometer</dt>
                            <dd>{inspection.odometer ?? '-'}</dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground">Catatan Umum</dt>
                            <dd>{inspection.notes ?? '-'}</dd>
                        </div>
                    </dl>
                </div>

                <div className="rounded-xl border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Komponen</TableHead>
                                <TableHead>Kondisi</TableHead>
                                <TableHead>Catatan</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {inspection.items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium">{item.component.label}</TableCell>
                                    <TableCell>
                                        <Badge variant={conditionBadgeVariant(item.condition.code)}>{item.condition.label}</Badge>
                                    </TableCell>
                                    <TableCell>{item.notes ?? '-'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
