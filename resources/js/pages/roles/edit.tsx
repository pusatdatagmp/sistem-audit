import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Permission, type Role } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Kelola Role', href: '/roles' },
    { title: 'Ubah Role', href: '#' },
];

interface RolesEditProps {
    role: Role;
    permissionGroups: Record<string, Permission[]>;
}

export default function RolesEdit({ role, permissionGroups }: RolesEditProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: role.name,
        description: role.description ?? '',
        permissions: (role.permissions ?? []).map((permission) => permission.id),
    });

    function togglePermission(permissionId: number, checked: boolean) {
        setData('permissions', checked ? [...data.permissions, permissionId] : data.permissions.filter((id) => id !== permissionId));
    }

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('roles.update', role.id));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Ubah Role - ${role.name}`} />

            <div className="max-w-xl p-4">
                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label>Kode</Label>
                        <Input value={role.code} disabled />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="name">Nama</Label>
                        <Input id="name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Deskripsi (opsional)</Label>
                        <Input id="description" value={data.description} onChange={(e) => setData('description', e.target.value)} />
                        <InputError message={errors.description} />
                    </div>

                    <div className="grid gap-3">
                        <Label>Izin Akses</Label>
                        {Object.entries(permissionGroups).map(([group, permissions]) => (
                            <div key={group} className="rounded-lg border p-3">
                                <p className="mb-2 text-sm font-medium">{group}</p>
                                <div className="space-y-2">
                                    {permissions.map((permission) => (
                                        <label key={permission.id} className="flex items-center gap-2 text-sm">
                                            <Checkbox
                                                checked={data.permissions.includes(permission.id)}
                                                onCheckedChange={(checked) => togglePermission(permission.id, checked === true)}
                                            />
                                            {permission.name}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <InputError message={errors.permissions} />
                    </div>

                    <Button type="submit" disabled={processing}>
                        Simpan Perubahan
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
