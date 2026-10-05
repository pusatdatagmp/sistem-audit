import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type MasterDataOption, type Vehicle } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Kendaraan', href: '/vehicles' },
    { title: 'Inspeksi Komponen', href: '/vehicles/inspections' },
    { title: 'Catat Inspeksi', href: '/vehicles/inspections/create' },
];

interface CreateInspectionProps {
    vehicles: Vehicle[];
    components: MasterDataOption[];
    conditionOptions: MasterDataOption[];
}

interface ItemState {
    condition_code: string;
    notes: string;
}

type FlatErrors = Record<string, string | undefined>;

export default function CreateInspection({ vehicles, components, conditionOptions }: CreateInspectionProps) {
    const defaultCondition = conditionOptions.find((option) => option.code === 'baik')?.code ?? (conditionOptions[0]?.code ?? '');

    const { data, setData, post, processing, errors, transform } = useForm({
        vehicle_id: '',
        odometer: '',
        notes: '',
        items: Object.fromEntries(
            components.map((component) => [component.id, { condition_code: defaultCondition, notes: '' } satisfies ItemState]),
        ),
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
        post(route('vehicles.inspections.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Catat Inspeksi Kendaraan" />

            <div className="max-w-3xl p-4">
                <form onSubmit={submit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                            <Input
                                id="odometer"
                                type="number"
                                min={0}
                                value={data.odometer}
                                onChange={(e) => setData('odometer', e.target.value)}
                            />
                            <InputError message={errors.odometer} />
                        </div>
                    </div>

                    <div className="rounded-xl border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Komponen</TableHead>
                                    <TableHead className="w-48">Kondisi</TableHead>
                                    <TableHead>Catatan</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {components.map((component) => (
                                    <TableRow key={component.id}>
                                        <TableCell className="font-medium">{component.label}</TableCell>
                                        <TableCell>
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
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                value={data.items[component.id]?.notes ?? ''}
                                                onChange={(e) => updateItem(component.id, { notes: e.target.value })}
                                                placeholder="Catatan (opsional)"
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
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
            </div>
        </AppLayout>
    );
}
