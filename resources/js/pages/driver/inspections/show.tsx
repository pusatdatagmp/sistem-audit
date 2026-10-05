import { Badge } from '@/components/ui/badge';
import DriverLayout from '@/layouts/driver-layout';
import { Head } from '@inertiajs/react';

interface InspectionDetail {
    id: number;
    inspected_at: string;
    odometer: number | null;
    notes: string | null;
    vehicle: { plate_number: string };
    items: { id: number; notes: string | null; component: { label: string }; condition: { code: string; label: string } }[];
}

interface DriverInspectionShowProps {
    inspection: InspectionDetail;
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

export default function DriverInspectionShow({ inspection }: DriverInspectionShowProps) {
    return (
        <DriverLayout>
            <Head title={`Inspeksi - ${inspection.vehicle.plate_number}`} />

            <div className="flex flex-col gap-4">
                <div className="rounded-xl border p-4">
                    <h1 className="text-xl font-semibold">{inspection.vehicle.plate_number}</h1>
                    <dl className="mt-2 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                        <div>
                            <dt className="text-muted-foreground">Tanggal Inspeksi</dt>
                            <dd>{new Date(inspection.inspected_at).toLocaleString('id-ID')}</dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground">Odometer</dt>
                            <dd>{inspection.odometer ?? '-'}</dd>
                        </div>
                        <div className="col-span-2">
                            <dt className="text-muted-foreground">Catatan Umum</dt>
                            <dd>{inspection.notes ?? '-'}</dd>
                        </div>
                    </dl>
                </div>

                <div className="flex flex-col gap-2">
                    {inspection.items.map((item) => (
                        <div key={item.id} className="rounded-lg border p-3">
                            <div className="flex items-center justify-between">
                                <p className="font-medium">{item.component.label}</p>
                                <Badge variant={conditionBadgeVariant(item.condition.code)}>{item.condition.label}</Badge>
                            </div>
                            {item.notes && <p className="text-muted-foreground mt-1 text-sm">{item.notes}</p>}
                        </div>
                    ))}
                </div>
            </div>
        </DriverLayout>
    );
}
