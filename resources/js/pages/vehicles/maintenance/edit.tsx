import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type MasterDataOption, type VehicleMaintenanceSchedule } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Kendaraan', href: '/vehicles' },
    { title: 'Jadwal Perawatan', href: '/vehicles/maintenance' },
    { title: 'Ubah', href: '#' },
];

interface EditMaintenanceProps {
    schedule: VehicleMaintenanceSchedule;
    typeOptions: MasterDataOption[];
    statusOptions: MasterDataOption[];
}

export default function EditMaintenance({ schedule, typeOptions, statusOptions }: EditMaintenanceProps) {
    const { data, setData, put, processing, errors } = useForm({
        maintenance_type_option_id: String(schedule.maintenance_type_option_id ?? schedule.maintenance_type?.id ?? ''),
        status_option_id: String(schedule.status_option_id ?? schedule.status?.id ?? ''),
        scheduled_date: schedule.scheduled_date.slice(0, 10),
        odometer_at_schedule: schedule.odometer_at_schedule?.toString() ?? '',
        notes: schedule.notes ?? '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('vehicles.maintenance.update', schedule.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Ubah Jadwal - ${schedule.vehicle.plate_number}`} />

            <div className="max-w-xl p-4">
                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label>Kendaraan</Label>
                        <Input value={schedule.vehicle.plate_number} disabled />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="maintenance_type_option_id">Jenis Perawatan</Label>
                        <Select value={data.maintenance_type_option_id} onValueChange={(value) => setData('maintenance_type_option_id', value)}>
                            <SelectTrigger id="maintenance_type_option_id">
                                <SelectValue placeholder="Pilih jenis" />
                            </SelectTrigger>
                            <SelectContent>
                                {typeOptions.map((option) => (
                                    <SelectItem key={option.id} value={String(option.id)}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.maintenance_type_option_id} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="status_option_id">Status</Label>
                        <Select value={data.status_option_id} onValueChange={(value) => setData('status_option_id', value)}>
                            <SelectTrigger id="status_option_id">
                                <SelectValue placeholder="Pilih status" />
                            </SelectTrigger>
                            <SelectContent>
                                {statusOptions.map((option) => (
                                    <SelectItem key={option.id} value={String(option.id)}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.status_option_id} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="scheduled_date">Tanggal Jadwal</Label>
                        <Input
                            id="scheduled_date"
                            type="date"
                            value={data.scheduled_date}
                            onChange={(e) => setData('scheduled_date', e.target.value)}
                        />
                        <InputError message={errors.scheduled_date} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="odometer_at_schedule">Odometer Saat Jadwal (opsional)</Label>
                        <Input
                            id="odometer_at_schedule"
                            type="number"
                            min={0}
                            value={data.odometer_at_schedule}
                            onChange={(e) => setData('odometer_at_schedule', e.target.value)}
                        />
                        <InputError message={errors.odometer_at_schedule} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="notes">Catatan (opsional)</Label>
                        <Input id="notes" value={data.notes} onChange={(e) => setData('notes', e.target.value)} />
                        <InputError message={errors.notes} />
                    </div>

                    <Button type="submit" disabled={processing}>
                        Simpan Perubahan
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
