import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Kitchen, type User, type Vehicle } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Kendaraan', href: '/vehicles' },
    { title: 'Riwayat Pemakaian', href: '/vehicles/usage-logs' },
    { title: 'Catat Pemakaian', href: '/vehicles/usage-logs/create' },
];

interface CreateUsageLogProps {
    vehicles: Vehicle[];
    drivers: User[];
    kitchens: Kitchen[];
}

export default function CreateUsageLog({ vehicles, drivers, kitchens }: CreateUsageLogProps) {
    const { data, setData, post, processing, errors } = useForm({
        vehicle_id: '',
        driver_id: '',
        kitchen_id: '',
        usage_date: new Date().toISOString().slice(0, 10),
        start_odometer: '',
        end_odometer: '',
        destination: '',
        purpose: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('vehicles.usage-logs.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Catat Pemakaian Kendaraan" />

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
                        <Label htmlFor="driver_id">Sopir</Label>
                        <Select value={data.driver_id} onValueChange={(value) => setData('driver_id', value)}>
                            <SelectTrigger id="driver_id">
                                <SelectValue placeholder="Pilih sopir" />
                            </SelectTrigger>
                            <SelectContent>
                                {drivers.map((driver) => (
                                    <SelectItem key={driver.id} value={String(driver.id)}>
                                        {driver.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.driver_id} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="kitchen_id">Dapur (opsional)</Label>
                        <Select value={data.kitchen_id || 'none'} onValueChange={(value) => setData('kitchen_id', value === 'none' ? '' : value)}>
                            <SelectTrigger id="kitchen_id">
                                <SelectValue placeholder="Tidak ada" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Tidak ada</SelectItem>
                                {kitchens.map((kitchen) => (
                                    <SelectItem key={kitchen.id} value={String(kitchen.id)}>
                                        {kitchen.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.kitchen_id} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="usage_date">Tanggal</Label>
                        <Input id="usage_date" type="date" value={data.usage_date} onChange={(e) => setData('usage_date', e.target.value)} />
                        <InputError message={errors.usage_date} />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="start_odometer">Odometer Awal (opsional)</Label>
                            <Input
                                id="start_odometer"
                                type="number"
                                min={0}
                                value={data.start_odometer}
                                onChange={(e) => setData('start_odometer', e.target.value)}
                            />
                            <InputError message={errors.start_odometer} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="end_odometer">Odometer Akhir (opsional)</Label>
                            <Input
                                id="end_odometer"
                                type="number"
                                min={0}
                                value={data.end_odometer}
                                onChange={(e) => setData('end_odometer', e.target.value)}
                            />
                            <InputError message={errors.end_odometer} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="destination">Tujuan (opsional)</Label>
                        <Input id="destination" value={data.destination} onChange={(e) => setData('destination', e.target.value)} />
                        <InputError message={errors.destination} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="purpose">Keperluan (opsional)</Label>
                        <Input id="purpose" value={data.purpose} onChange={(e) => setData('purpose', e.target.value)} />
                        <InputError message={errors.purpose} />
                    </div>

                    <Button type="submit" disabled={processing}>
                        Simpan
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
