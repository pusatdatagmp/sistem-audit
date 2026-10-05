import PaginationFooter from '@/components/pagination-footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useFlashToast } from '@/hooks/use-flash-toast';
import DriverLayout from '@/layouts/driver-layout';
import { type Paginated } from '@/types';
import { Head, Link } from '@inertiajs/react';

interface InspectionListItem {
    id: number;
    inspected_at: string;
    odometer: number | null;
    vehicle: { plate_number: string };
    items: { condition: { code: string; label: string } }[];
}

interface DriverInspectionIndexProps {
    inspections: Paginated<InspectionListItem>;
}

function worstConditionLabel(items: InspectionListItem['items']): { label: string; variant: 'default' | 'outline' | 'destructive' } {
    if (items.some((item) => item.condition.code === 'rusak-berat')) {
        return { label: 'Ada yang rusak berat', variant: 'destructive' };
    }

    if (items.some((item) => item.condition.code === 'perlu-perbaikan')) {
        return { label: 'Ada yang perlu perbaikan', variant: 'outline' };
    }

    return { label: 'Semua baik', variant: 'default' };
}

export default function DriverInspectionIndex({ inspections }: DriverInspectionIndexProps) {
    useFlashToast();

    return (
        <DriverLayout>
            <Head title="Inspeksi Kendaraan Saya" />

            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h1 className="text-xl font-semibold">Inspeksi Kendaraan Saya</h1>
                <Button asChild className="shrink-0">
                    <Link href={route('driver.inspections.create')}>Inspeksi Baru</Link>
                </Button>
            </div>

            <div className="space-y-3">
                {inspections.data.length === 0 && (
                    <Card>
                        <CardContent className="text-muted-foreground py-8 text-center text-sm">Belum ada inspeksi yang dicatat.</CardContent>
                    </Card>
                )}

                {inspections.data.map((inspection) => {
                    const summary = worstConditionLabel(inspection.items);

                    return (
                        <Link key={inspection.id} href={route('driver.inspections.show', inspection.id)}>
                            <Card className="hover:bg-muted/50 transition-colors">
                                <CardContent className="flex items-start justify-between p-4">
                                    <div>
                                        <p className="font-medium">{inspection.vehicle.plate_number}</p>
                                        <p className="text-muted-foreground text-sm">
                                            {new Date(inspection.inspected_at).toLocaleString('id-ID')}
                                            {inspection.odometer ? ` · ${inspection.odometer} km` : ''}
                                        </p>
                                    </div>
                                    <Badge variant={summary.variant}>{summary.label}</Badge>
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}
            </div>

            <div className="mt-4">
                <PaginationFooter paginated={inspections} />
            </div>
        </DriverLayout>
    );
}
