import PaginationFooter from '@/components/pagination-footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useFlashToast } from '@/hooks/use-flash-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type Kitchen, type Paginated } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import Swal from 'sweetalert2';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Master Data', href: '/master-data/kitchens' }, { title: 'Dapur', href: '/master-data/kitchens' }];

interface KitchensIndexProps {
    kitchens: Paginated<Kitchen>;
}

export default function KitchensIndex({ kitchens }: KitchensIndexProps) {
    useFlashToast();

    async function handleDelete(kitchen: Kitchen) {
        const confirmation = await Swal.fire({
            icon: 'warning',
            title: `Hapus ${kitchen.name}?`,
            text: 'Tindakan ini tidak bisa dibatalkan.',
            showCancelButton: true,
            confirmButtonText: 'Ya, hapus',
            cancelButtonText: 'Batal',
        });

        if (confirmation.isConfirmed) {
            router.delete(route('master-data.kitchens.destroy', kitchen.id));
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dapur" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex justify-between">
                    <h1 className="text-xl font-semibold">Dapur</h1>
                    <Button asChild>
                        <Link href={route('master-data.kitchens.create')}>Tambah Dapur</Link>
                    </Button>
                </div>

                <div className="rounded-xl border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Kode</TableHead>
                                <TableHead>Nama</TableHead>
                                <TableHead>PIC</TableHead>
                                <TableHead>Telepon</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {kitchens.data.map((kitchen) => (
                                <TableRow key={kitchen.id}>
                                    <TableCell>{kitchen.code}</TableCell>
                                    <TableCell>{kitchen.name}</TableCell>
                                    <TableCell>{kitchen.pic_name ?? '-'}</TableCell>
                                    <TableCell>{kitchen.phone ?? '-'}</TableCell>
                                    <TableCell>
                                        <Badge variant={kitchen.is_active ? 'default' : 'outline'}>
                                            {kitchen.is_active ? 'Aktif' : 'Nonaktif'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button size="sm" variant="outline" asChild>
                                                <Link href={route('master-data.kitchens.edit', kitchen.id)}>Ubah</Link>
                                            </Button>
                                            <Button size="sm" variant="destructive" onClick={() => handleDelete(kitchen)}>
                                                Hapus
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                <PaginationFooter paginated={kitchens} />
            </div>
        </AppLayout>
    );
}
