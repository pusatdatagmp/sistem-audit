import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Permission } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Kelola Role', href: '/roles' },
    { title: 'Tambah Role', href: '/roles/create' },
];

interface RolesCreateProps {
    permissionGroups: Record<string, Permission[]>;
}

export default function RolesCreate({ permissionGroups }: RolesCreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        code: '',
        name: '',
        description: '',
        permissions: [] as number[],
    });

    function togglePermission(permissionId: number, checked: boolean) {
        setData('permissions', checked ? [...data.permissions, permissionId] : data.permissions.filter((id) => id !== permissionId));
    }

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('roles.store'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Role" />

            <div className="max-w-xl p-4">
                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="code">Kode (huruf/angka/garis bawah, unik)</Label>
                        <Input id="code" value={data.code} onChange={(e) => setData('code', e.target.value)} />
                        <InputError message={errors.code} />
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
                        Simpan
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
