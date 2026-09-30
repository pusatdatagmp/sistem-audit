import PaginationFooter from '@/components/pagination-footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useFlashToast } from '@/hooks/use-flash-toast';
import DriverLayout from '@/layouts/driver-layout';
import { type Paginated, type VehicleUsageLog } from '@/types';
import { Head, Link } from '@inertiajs/react';

interface DriverIndexProps {
    usageLogs: Paginated<VehicleUsageLog>;
}

export default function DriverIndex({ usageLogs }: DriverIndexProps) {
    useFlashToast();

    return (
        <DriverLayout>
            <Head title="Riwayat Pemakaian Saya" />

            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-xl font-semibold">Riwayat Pemakaian Saya</h1>
                <Button asChild>
                    <Link href={route('driver.create')}>Catat Pemakaian</Link>
                </Button>
            </div>

            <div className="space-y-3">
                {usageLogs.data.length === 0 && (
                    <Card>
                        <CardContent className="text-muted-foreground py-8 text-center text-sm">
                            Belum ada riwayat pemakaian yang dicatat.
                        </CardContent>
                    </Card>
                )}

                {usageLogs.data.map((usageLog) => (
                    <Link key={usageLog.id} href={route('driver.edit', usageLog.id)}>
                        <Card className="hover:bg-muted/50 transition-colors">
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <p className="font-medium">{usageLog.vehicle.plate_number}</p>
                                    <p className="text-muted-foreground text-sm">{usageLog.usage_date}</p>
                                </div>
                                <p className="text-muted-foreground text-sm">
                                    {usageLog.destination ?? '-'} {usageLog.kitchen ? `· ${usageLog.kitchen.name}` : ''}
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            <div className="mt-4">
                <PaginationFooter paginated={usageLogs} />
            </div>
        </DriverLayout>
    );
}
