import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DriverLayout from '@/layouts/driver-layout';
import { type MasterDataOption, type Vehicle } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

interface DriverInspectionCreateProps {
    vehicles: Vehicle[];
    components: MasterDataOption[];
    conditionOptions: MasterDataOption[];
}

interface ItemState {
    condition_code: string;
    notes: string;
}

type FlatErrors = Record<string, string | undefined>;

export default function DriverInspectionCreate({ vehicles, components, conditionOptions }: DriverInspectionCreateProps) {
    const defaultCondition = conditionOptions.find((option) => option.code === 'baik')?.code ?? conditionOptions[0]?.code ?? '';

    const { data, setData, post, processing, errors, transform } = useForm({
        vehicle_id: '',
        odometer: '',
        notes: '',
        items: Object.fromEntries(components.map((component) => [component.id, { condition_code: defaultCondition, notes: '' } satisfies ItemState])),
    });

    transform((formData) => ({
        ...formData,
        items: Object.entries(formData.items).map(([componentOptionId, item]) => ({
            component_option_id: Number(componentOptionId),
            condition_code: item.condition_code,
            notes: item.notes || null,
        })),
    }));

    function updateItem(componentId: number, patch: Partial<ItemState>) {
        setData('items', {
            ...data.items,
            [componentId]: { ...data.items[componentId], ...patch },
        });
    }

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('driver.inspections.store'));
    };

    return (
        <DriverLayout>
            <Head title="Inspeksi Kendaraan Harian" />

            <h1 className="mb-4 text-xl font-semibold">Inspeksi Kendaraan Harian</h1>

            <form onSubmit={submit} className="space-y-6">
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
                    <Label htmlFor="odometer">Odometer (opsional)</Label>
                    <Input id="odometer" type="number" min={0} value={data.odometer} onChange={(e) => setData('odometer', e.target.value)} />
                    <InputError message={errors.odometer} />
                </div>

                <div className="grid gap-3">
                    <Label>Kondisi Komponen</Label>
                    {components.map((component) => (
                        <div key={component.id} className="rounded-lg border p-3">
                            <p className="mb-2 text-sm font-medium">{component.label}</p>

                            <div className="grid gap-2">
                                <Select
                                    value={data.items[component.id]?.condition_code ?? defaultCondition}
                                    onValueChange={(value) => updateItem(component.id, { condition_code: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {conditionOptions.map((option) => (
                                            <SelectItem key={option.id} value={option.code}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={(errors as FlatErrors)[`items.${component.id}.condition_code`]} />

                                <Input
                                    value={data.items[component.id]?.notes ?? ''}
                                    onChange={(e) => updateItem(component.id, { notes: e.target.value })}
                                    placeholder="Catatan (opsional)"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="notes">Catatan Umum (opsional)</Label>
                    <Input id="notes" value={data.notes} onChange={(e) => setData('notes', e.target.value)} />
                    <InputError message={errors.notes} />
                </div>

                <Button type="submit" disabled={processing}>
                    Simpan Inspeksi
                </Button>
            </form>
        </DriverLayout>
    );
}
