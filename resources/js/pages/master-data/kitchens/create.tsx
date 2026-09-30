import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Master Data', href: '/master-data/kitchens' },
    { title: 'Dapur', href: '/master-data/kitchens' },
    { title: 'Tambah', href: '/master-data/kitchens/create' },
];

export default function CreateKitchen() {
    const { data, setData, post, processing, errors } = useForm({
        code: '',
        name: '',
        address: '',
        pic_name: '',
        phone: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('master-data.kitchens.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Dapur" />

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

                    <Button type="submit" disabled={processing}>
                        Simpan
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
