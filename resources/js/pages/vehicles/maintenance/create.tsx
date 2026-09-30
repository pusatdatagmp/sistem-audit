import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type MasterDataOption, type Vehicle } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Kendaraan', href: '/vehicles' },
    { title: 'Jadwal Perawatan', href: '/vehicles/maintenance' },
    { title: 'Tambah', href: '/vehicles/maintenance/create' },
];

interface CreateMaintenanceProps {
    vehicles: Vehicle[];
    typeOptions: MasterDataOption[];
    statusOptions: MasterDataOption[];
}

export default function CreateMaintenance({ vehicles, typeOptions, statusOptions }: CreateMaintenanceProps) {
    const { data, setData, post, processing, errors } = useForm({
        vehicle_id: '',
        maintenance_type_option_id: '',
        status_option_id: statusOptions.find((option) => option.code === 'terjadwal')?.id.toString() ?? '',
        scheduled_date: '',
        odometer_at_schedule: '',
        notes: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('vehicles.maintenance.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Jadwal Perawatan" />

            <div className="max-w-xl p-4">
                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="vehicle_id">Kendaraan</Label>
                        <Select value={data.vehicle_id} onValueChange={(value) => setData('vehicle_id', value)}>
                            <SelectTrigger id="vehicle_id">
                                <SelectValue placeholder="Pilih kendaraan" />
                            </SelectTrigger>
                            <SelectContent>
                                {vehicles.map((vehicle) => (
                                    <SelectItem key={vehicle.id} value={String(vehicle.id)}>
                                        {vehicle.plate_number}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.vehicle_id} />
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
                        Simpan
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
