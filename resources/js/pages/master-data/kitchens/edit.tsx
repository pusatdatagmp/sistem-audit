import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Kitchen } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Master Data', href: '/master-data/kitchens' },
    { title: 'Dapur', href: '/master-data/kitchens' },
    { title: 'Ubah', href: '#' },
];

interface EditKitchenProps {
    kitchen: Kitchen;
}

export default function EditKitchen({ kitchen }: EditKitchenProps) {
    const { data, setData, put, processing, errors } = useForm({
        code: kitchen.code ?? '',
        name: kitchen.name,
        address: kitchen.address ?? '',
        pic_name: kitchen.pic_name ?? '',
        phone: kitchen.phone ?? '',
        is_active: kitchen.is_active ?? true,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('master-data.kitchens.update', kitchen.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Ubah ${kitchen.name}`} />

            <div className="max-w-xl p-4">
                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="code">Kode</Label>
                        <Input id="code" value={data.code} onChange={(e) => setData('code', e.target.value)} />
                        <InputError message={errors.code} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="name">Nama Dapur</Label>
                        <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="address">Alamat (opsional)</Label>
                        <Input id="address" value={data.address} onChange={(e) => setData('address', e.target.value)} />
                        <InputError message={errors.address} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="pic_name">Penanggung Jawab (opsional)</Label>
                        <Input id="pic_name" value={data.pic_name} onChange={(e) => setData('pic_name', e.target.value)} />
                        <InputError message={errors.pic_name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="phone">Telepon (opsional)</Label>
                        <Input id="phone" value={data.phone} onChange={(e) => setData('phone', e.target.value)} />
                        <InputError message={errors.phone} />
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
