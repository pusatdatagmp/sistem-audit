import PaginationFooter from '@/components/pagination-footer';
import SortableHeader from '@/components/sortable-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useFlashToast } from '@/hooks/use-flash-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Kitchen, type Paginated, type Role, type SharedData, type User } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Kelola Pengguna', href: '/users' }];

interface UsersFilters {
    search?: string;
    role_id?: string;
    kitchen_id?: string;
    sort?: string | null;
    direction?: 'asc' | 'desc' | null;
}

interface UsersIndexProps {
    users: Paginated<User>;
    roles: Role[];
    kitchens: Kitchen[];
    filters: UsersFilters;
}

export default function UsersIndex({ users, roles, kitchens, filters }: UsersIndexProps) {
    useFlashToast();

    const { auth } = usePage<SharedData>().props;
    const [search, setSearch] = useState(filters.search ?? '');

    function updateFilter(key: keyof UsersFilters, value: string) {
        router.get(route('users.index'), { ...filters, [key]: value === 'all' ? undefined : value }, { preserveState: true, replace: true });
    }

    useEffect(() => {
        if (search === (filters.search ?? '')) {
            return;
        }

        const timeout = setTimeout(() => {
            router.get(route('users.index'), { ...filters, search: search || undefined }, { preserveState: true, replace: true });
        }, 400);

        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    async function handleRoleChange(user: User, roleId: string) {
        if (roleId === String(user.role.id)) {
            return;
        }

        const newRole = roles.find((role) => role.id === Number(roleId));
        const becomesDriver = newRole?.code === 'driver';

        let kitchenId: string | undefined;

        if (becomesDriver) {
            const { value, isConfirmed } = await Swal.fire({
                icon: 'question',
                title: `Pilih dapur untuk ${user.name}`,
                input: 'select',
                inputOptions: Object.fromEntries(kitchens.map((kitchen) => [kitchen.id, kitchen.name])),
                inputPlaceholder: 'Pilih dapur',
                showCancelButton: true,
                confirmButtonText: 'Ya, ubah',
                cancelButtonText: 'Batal',
                inputValidator: (value) => (!value ? 'Dapur wajib dipilih untuk role driver.' : undefined),
            });

            if (!isConfirmed) {
                return;
            }

            kitchenId = value;
        } else {
            const confirmation = await Swal.fire({
                icon: 'warning',
                title: `Ubah role ${user.name} menjadi ${newRole?.name}?`,
                showCancelButton: true,
                confirmButtonText: 'Ya, ubah',
                cancelButtonText: 'Batal',
            });

            if (!confirmation.isConfirmed) {
                return;
            }
        }

        router.put(
            route('users.update-role', user.id),
            { role_id: roleId, kitchen_id: kitchenId },
            {
                preserveScroll: true,
                onError: (errors) => {
                    Swal.fire({ icon: 'error', title: 'Gagal mengubah role', text: errors.role_id ?? errors.kitchen_id });
                },
            },
        );
    }

    async function handleDelete(user: User) {
        const confirmation = await Swal.fire({
            icon: 'warning',
            title: `Hapus ${user.name}?`,
            text: 'Tindakan ini tidak bisa dibatalkan.',
            showCancelButton: true,
            confirmButtonText: 'Ya, hapus',
            cancelButtonText: 'Batal',
        });

        if (!confirmation.isConfirmed) {
            return;
        }

        router.delete(route('users.destroy', user.id), {
            preserveScroll: true,
            onError: (errors) => {
                Swal.fire({ icon: 'error', title: 'Gagal menghapus pengguna', text: errors.user });
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Pengguna" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h1 className="text-xl font-semibold">Kelola Pengguna</h1>
                    <div className="flex flex-wrap gap-2">
                        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama/email..." className="w-64" />

                        <Select value={filters.role_id ?? 'all'} onValueChange={(value) => updateFilter('role_id', value)}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Semua Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Role</SelectItem>
                                {roles.map((role) => (
                                    <SelectItem key={role.id} value={String(role.id)}>
                                        {role.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={filters.kitchen_id ?? 'all'} onValueChange={(value) => updateFilter('kitchen_id', value)}>
                            <SelectTrigger className="w-48">
                                <SelectValue placeholder="Semua Dapur" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Dapur</SelectItem>
                                {kitchens.map((kitchen) => (
                                    <SelectItem key={kitchen.id} value={String(kitchen.id)}>
                                        {kitchen.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Button asChild>
                            <Link href={route('users.create')}>Tambah Pengguna</Link>
                        </Button>
                    </div>
                </div>

                <div className="rounded-xl border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>No</TableHead>
                                <SortableHeader label="Nama" sortKey="name" routeName="users.index" filters={filters} />
                                <SortableHeader label="Email" sortKey="email" routeName="users.index" filters={filters} />
                                <SortableHeader label="Role" sortKey="role" routeName="users.index" filters={filters} />
                                <SortableHeader label="Dapur" sortKey="kitchen" routeName="users.index" filters={filters} />
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.data.map((user, index) => (
                                <TableRow key={user.id}>
                                    <TableCell>{(users.from ?? 1) + index}</TableCell>
                                    <TableCell className="font-medium">
                                        {user.name}
                                        {user.id === auth.user.id && (
                                            <Badge variant="outline" className="ml-2">
                                                Anda
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Select
                                            value={String(user.role.id)}
                                            disabled={user.id === auth.user.id}
                                            onValueChange={(value) => handleRoleChange(user, value)}
                                        >
                                            <SelectTrigger className="w-48">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {roles.map((role) => (
                                                    <SelectItem key={role.id} value={String(role.id)}>
                                                        {role.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell>{user.kitchen?.name ?? '-'}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button size="sm" variant="outline" asChild>
                                                <Link href={route('users.edit', user.id)}>Edit</Link>
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                disabled={user.id === auth.user.id}
                                                onClick={() => handleDelete(user)}
                                            >
                                                Hapus
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <PaginationFooter paginated={users} />
            </div>
        </AppLayout>
    );
}
