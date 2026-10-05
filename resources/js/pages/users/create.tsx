import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Kitchen, type Role } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Kelola Pengguna', href: '/users' },
    { title: 'Tambah Pengguna', href: '/users/create' },
];

interface UsersCreateProps {
    roles: Role[];
    kitchens: Kitchen[];
}

export default function UsersCreate({ roles, kitchens }: UsersCreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role_id: '',
        kitchen_id: '',
    });

    const isDriver = roles.find((role) => role.id === Number(data.role_id))?.code === 'driver';

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('users.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Pengguna" />

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
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="role_id">Role</Label>
                        <Select value={data.role_id} onValueChange={(value) => setData('role_id', value)}>
                            <SelectTrigger id="role_id">
                                <SelectValue placeholder="Pilih role" />
                            </SelectTrigger>
                            <SelectContent>
                                {roles.map((role) => (
                                    <SelectItem key={role.id} value={String(role.id)}>
                                        {role.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.role_id} />
                    </div>

                    {isDriver && (
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
