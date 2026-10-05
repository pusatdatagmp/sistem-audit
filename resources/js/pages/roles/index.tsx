import PaginationFooter from '@/components/pagination-footer';
import SortableHeader from '@/components/sortable-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useFlashToast } from '@/hooks/use-flash-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Paginated, type Role } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Kelola Role', href: '/roles' }];

interface RolesFilters {
    search?: string;
    sort?: string | null;
    direction?: 'asc' | 'desc' | null;
}

interface RolesIndexProps {
    roles: Paginated<Role>;
    filters: RolesFilters;
}

export default function RolesIndex({ roles, filters }: RolesIndexProps) {
    useFlashToast();

    const [search, setSearch] = useState(filters.search ?? '');

    useEffect(() => {
        if (search === (filters.search ?? '')) {
            return;
        }

        const timeout = setTimeout(() => {
            router.get(route('roles.index'), { ...filters, search: search || undefined }, { preserveState: true, replace: true });
        }, 400);

        return () => clearTimeout(timeout);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    async function handleDelete(role: Role) {
        const confirmation = await Swal.fire({
            icon: 'warning',
            title: `Hapus role ${role.name}?`,
            text: 'Tindakan ini tidak bisa dibatalkan.',
            showCancelButton: true,
            confirmButtonText: 'Ya, hapus',
            cancelButtonText: 'Batal',
        });

        if (confirmation.isConfirmed) {
            router.delete(route('roles.destroy', role.id));
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola Role" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                        <h1 className="text-xl font-semibold">Kelola Role</h1>
                        <p className="text-sm text-muted-foreground">Atur role dan izin akses yang bisa diberikan ke pengguna.</p>
                    </div>
                    <Button asChild className="shrink-0">
                        <Link href={route('roles.create')}>Tambah Role</Link>
                    </Button>
                </div>

                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari nama/kode role..." className="w-64" />

                <div className="rounded-xl border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <SortableHeader label="Nama" sortKey="name" routeName="roles.index" filters={filters} />
                                <SortableHeader label="Kode" sortKey="code" routeName="roles.index" filters={filters} />
                                <SortableHeader
                                    label="Jumlah Izin"
                                    sortKey="permissions_count"
                                    routeName="roles.index"
                                    filters={filters}
                                    className="text-right"
                                />
                                <SortableHeader
                                    label="Jumlah Pengguna"
                                    sortKey="users_count"
                                    routeName="roles.index"
                                    filters={filters}
                                    className="text-right"
                                />
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {roles.data.map((role) => (
                                <TableRow key={role.id}>
                                    <TableCell className="font-medium">{role.name}</TableCell>
                                    <TableCell className="font-mono text-xs">{role.code}</TableCell>
                                    <TableCell className="text-right">{role.permissions_count ?? 0}</TableCell>
                                    <TableCell className="text-right">{role.users_count ?? 0}</TableCell>
                                    <TableCell>
                                        {role.is_locked ? <Badge variant="outline">Bawaan Sistem</Badge> : <Badge variant="secondary">Kustom</Badge>}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button size="sm" variant="outline" asChild>
                                                <Link href={route('roles.edit', role.id)}>Ubah</Link>
                                            </Button>
                                            {!role.is_locked && (
                                                <Button size="sm" variant="destructive" onClick={() => handleDelete(role)}>
                                                    Hapus
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <PaginationFooter paginated={roles} />
            </div>
        </AppLayout>
    );
}
