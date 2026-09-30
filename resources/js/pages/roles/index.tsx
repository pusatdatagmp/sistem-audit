import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useFlashToast } from '@/hooks/use-flash-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Role } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import Swal from 'sweetalert2';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Kelola Role', href: '/roles' }];

interface RolesIndexProps {
    roles: Role[];
}

export default function RolesIndex({ roles }: RolesIndexProps) {
    useFlashToast();

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
                <div className="flex justify-between">
                    <div>
                        <h1 className="text-xl font-semibold">Kelola Role</h1>
                        <p className="text-sm text-muted-foreground">Atur role dan izin akses yang bisa diberikan ke pengguna.</p>
                    </div>
                    <Button asChild>
                        <Link href={route('roles.create')}>Tambah Role</Link>
                    </Button>
                </div>

                <div className="rounded-xl border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nama</TableHead>
                                <TableHead>Kode</TableHead>
                                <TableHead className="text-right">Jumlah Izin</TableHead>
                                <TableHead className="text-right">Jumlah Pengguna</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {roles.map((role) => (
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
            </div>
        </AppLayout>
    );
}
