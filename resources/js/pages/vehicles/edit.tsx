import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Kitchen, type MasterDataOption, type Vehicle } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Kendaraan', href: '/vehicles' },
    { title: 'Ubah', href: '#' },
];

interface EditVehicleProps {
    vehicle: Vehicle;
    typeOptions: MasterDataOption[];
    statusOptions: MasterDataOption[];
    kitchens: Kitchen[];
}

export default function EditVehicle({ vehicle, typeOptions, statusOptions, kitchens }: EditVehicleProps) {
    const { data, setData, put, processing, errors } = useForm({
        plate_number: vehicle.plate_number,
        vehicle_type_option_id: String(vehicle.vehicle_type_option_id ?? vehicle.vehicle_type?.id ?? ''),
        status_option_id: String(vehicle.status_option_id ?? vehicle.status?.id ?? ''),
        home_kitchen_id: vehicle.home_kitchen_id ? String(vehicle.home_kitchen_id) : '',
        brand: vehicle.brand ?? '',
        model: vehicle.model ?? '',
        year: vehicle.year ? String(vehicle.year) : '',
        is_active: vehicle.is_active,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('vehicles.update', vehicle.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Ubah ${vehicle.plate_number}`} />

            <div className="max-w-xl p-4">
                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="plate_number">Plat Nomor</Label>
                        <Input id="plate_number" value={data.plate_number} onChange={(e) => setData('plate_number', e.target.value)} />
                        <InputError message={errors.plate_number} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="vehicle_type_option_id">Jenis Kendaraan</Label>
                        <Select value={data.vehicle_type_option_id} onValueChange={(value) => setData('vehicle_type_option_id', value)}>
                            <SelectTrigger id="vehicle_type_option_id">
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
                        <InputError message={errors.vehicle_type_option_id} />
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
                        <Label htmlFor="home_kitchen_id">Dapur Home Base (opsional)</Label>
                        <Select
                            value={data.home_kitchen_id || 'none'}
                            onValueChange={(value) => setData('home_kitchen_id', value === 'none' ? '' : value)}
                        >
                            <SelectTrigger id="home_kitchen_id">
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
                        <InputError message={errors.home_kitchen_id} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="brand">Merek (opsional)</Label>
                        <Input id="brand" value={data.brand} onChange={(e) => setData('brand', e.target.value)} />
                        <InputError message={errors.brand} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="model">Model (opsional)</Label>
                        <Input id="model" value={data.model} onChange={(e) => setData('model', e.target.value)} />
                        <InputError message={errors.model} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="year">Tahun (opsional)</Label>
                        <Input id="year" type="number" value={data.year} onChange={(e) => setData('year', e.target.value)} />
                        <InputError message={errors.year} />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            id="is_active"
                            type="checkbox"
                            checked={data.is_active}
                            onChange={(e) => setData('is_active', e.target.checked)}
                            className="h-4 w-4 rounded border-input"
                        />
                        <Label htmlFor="is_active">Aktif</Label>
                    </div>

                    <Button type="submit" disabled={processing}>
                        Simpan Perubahan
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
