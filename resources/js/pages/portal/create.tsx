import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import PortalLayout from '@/layouts/portal-layout';
import { type Kitchen, type KitchenTool, type MasterDataOption, type SharedData, type Vehicle } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState } from 'react';

interface PortalCreateProps {
    kitchens: Kitchen[];
    categoryOptions: MasterDataOption[];
    priorityOptions: MasterDataOption[];
    kitchenTools: KitchenTool[];
    vehicles: Vehicle[];
}

export default function PortalCreate({ kitchens, categoryOptions, priorityOptions, kitchenTools, vehicles }: PortalCreateProps) {
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const { auth } = usePage<SharedData>().props;
    const driverKitchen = auth.user.role.code === 'driver' ? auth.user.kitchen : null;

    const { data, setData, post, processing, errors } = useForm({
        kitchen_id: driverKitchen ? String(driverKitchen.id) : '',
        category_option_id: '',
        priority_option_id: '',
        related_kitchen_tool_id: '',
        related_vehicle_id: '',
        subject: '',
        description: '',
        photo: null as File | null,
    });

    useEffect(() => {
        if (!data.photo) {
            setPhotoPreview(null);
            return;
        }

        const url = URL.createObjectURL(data.photo);
        setPhotoPreview(url);

        return () => URL.revokeObjectURL(url);
    }, [data.photo]);

    const selectedCategory = categoryOptions.find((option) => String(option.id) === data.category_option_id);
    const isKitchenToolIssue = selectedCategory?.code === 'kerusakan-alat-dapur';
    const isVehicleIssue = selectedCategory?.code === 'kendala-kendaraan';

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('portal.store'), { forceFormData: true });
    };

    return (
        <PortalLayout>
            <Head title="Buat Laporan" />

            <h1 className="mb-4 text-xl font-semibold">Buat Laporan Pengaduan</h1>

            <form onSubmit={submit} className="bg-background space-y-4 rounded-xl border p-4">
                <div className="grid gap-2">
                    <Label htmlFor="category_option_id">Kategori Masalah</Label>
                    <Select value={data.category_option_id} onValueChange={(value) => setData('category_option_id', value)}>
                        <SelectTrigger id="category_option_id">
                            <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                        <SelectContent>
                            {categoryOptions.map((option) => (
                                <SelectItem key={option.id} value={String(option.id)}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.category_option_id} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="priority_option_id">Tingkat Darurat</Label>
                    <Select value={data.priority_option_id} onValueChange={(value) => setData('priority_option_id', value)}>
                        <SelectTrigger id="priority_option_id">
                            <SelectValue placeholder="Pilih prioritas" />
                        </SelectTrigger>
                        <SelectContent>
                            {priorityOptions.map((option) => (
                                <SelectItem key={option.id} value={String(option.id)}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <InputError message={errors.priority_option_id} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="kitchen_id">Dapur Terkait</Label>
                    {driverKitchen ? (
                        <Input id="kitchen_id" value={driverKitchen.name} disabled readOnly />
                    ) : (
                        <Select value={data.kitchen_id} onValueChange={(value) => setData('kitchen_id', value)}>
                            <SelectTrigger id="kitchen_id">
                                <SelectValue placeholder="Pilih dapur" />
                            </SelectTrigger>
                            <SelectContent>
                                {kitchens.map((kitchen) => (
                                    <SelectItem key={kitchen.id} value={String(kitchen.id)}>
                                        {kitchen.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                    <InputError message={errors.kitchen_id} />
                </div>

                {isKitchenToolIssue && (
                    <div className="grid gap-2">
                        <Label htmlFor="related_kitchen_tool_id">Alat Dapur Terkait (opsional)</Label>
                        <Select
                            value={data.related_kitchen_tool_id || 'none'}
                            onValueChange={(value) => setData('related_kitchen_tool_id', value === 'none' ? '' : value)}
                        >
                            <SelectTrigger id="related_kitchen_tool_id">
                                <SelectValue placeholder="Tidak ada" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Tidak ada</SelectItem>
                                {kitchenTools.map((tool) => (
                                    <SelectItem key={tool.id} value={String(tool.id)}>
                                        {tool.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.related_kitchen_tool_id} />
                    </div>
                )}

                {isVehicleIssue && (
                    <div className="grid gap-2">
                        <Label htmlFor="related_vehicle_id">Kendaraan Terkait (opsional)</Label>
                        <Select
                            value={data.related_vehicle_id || 'none'}
                            onValueChange={(value) => setData('related_vehicle_id', value === 'none' ? '' : value)}
                        >
                            <SelectTrigger id="related_vehicle_id">
                                <SelectValue placeholder="Tidak ada" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Tidak ada</SelectItem>
                                {vehicles.map((vehicle) => (
                                    <SelectItem key={vehicle.id} value={String(vehicle.id)}>
                                        {vehicle.plate_number}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.related_vehicle_id} />
                    </div>
                )}

                <div className="grid gap-2">
                    <Label htmlFor="subject">Judul Masalah</Label>
                    <Input id="subject" value={data.subject} onChange={(e) => setData('subject', e.target.value)} />
                    <InputError message={errors.subject} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="description">Deskripsi Masalah</Label>
                    <Textarea id="description" rows={5} value={data.description} onChange={(e) => setData('description', e.target.value)} />
                    <InputError message={errors.description} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="photo">Foto Bukti</Label>
                    <Input
                        id="photo"
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(e) => setData('photo', e.target.files?.[0] ?? null)}
                    />
                    {photoPreview && <img src={photoPreview} alt="Pratinjau foto" className="mt-1 max-h-48 rounded-lg border object-contain" />}
                    <InputError message={errors.photo} />
                </div>

                <Button type="submit" disabled={processing}>
                    Kirim Laporan
                </Button>
            </form>
        </PortalLayout>
    );
}
