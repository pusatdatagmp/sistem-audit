import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Kitchen } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Kelola Pengguna', href: '/users' },
    { title: 'Edit Pengguna', href: '#' },
];

interface EditableUser {
    id: number;
    name: string;
    email: string;
    kitchen_id: number | null;
    is_driver: boolean;
}

interface UsersEditProps {
    user: EditableUser;
    kitchens: Kitchen[];
}

export default function UsersEdit({ user, kitchens }: UsersEditProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
        kitchen_id: user.kitchen_id ? String(user.kitchen_id) : '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('users.update', user.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Pengguna" />

            <div className="max-w-xl p-4">
                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nama</Label>
                        <Input id="name" autoFocus value={data.name} onChange={(e) => setData('name', e.target.value)} />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" autoComplete="email" value={data.email} onChange={(e) => setData('email', e.target.value)} />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Password Baru (opsional)</Label>
                        <Input
                            id="password"
                            type="password"
                            autoComplete="new-password"
                            placeholder="Kosongkan jika tidak ingin mengubah"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Konfirmasi Password Baru</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <p className="text-muted-foreground text-xs">Untuk mengubah role pengguna, gunakan pilihan role di halaman daftar pengguna.</p>

                    {user.is_driver && (
                        <div className="grid gap-2">
                            <Label htmlFor="kitchen_id">Dapur</Label>
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
                            <InputError message={errors.kitchen_id} />
                        </div>
                    )}

                    <div className="flex gap-2">
                        <Button type="submit" disabled={processing}>
                            Simpan
                        </Button>
                        <Button type="button" variant="outline" asChild>
                            <Link href={route('users.index')}>Batal</Link>
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
