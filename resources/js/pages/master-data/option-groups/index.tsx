import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useFlashToast } from '@/hooks/use-flash-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type MasterDataGroup } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import Swal from 'sweetalert2';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Master Data', href: '/master-data/kitchens' },
    { title: 'Kategori & Opsi', href: '/master-data/option-groups' },
];

interface OptionGroupsIndexProps {
    groups: MasterDataGroup[];
}

export default function OptionGroupsIndex({ groups }: OptionGroupsIndexProps) {
    useFlashToast();

    const [open, setOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        code: '',
        name: '',
        description: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('master-data.option-groups.store'), {
            onSuccess: () => {
                reset();
                setOpen(false);
            },
        });
    };

    async function handleDelete(group: MasterDataGroup) {
        const confirmation = await Swal.fire({
            icon: 'warning',
            title: `Hapus grup ${group.name}?`,
            text: 'Tindakan ini tidak bisa dibatalkan.',
            showCancelButton: true,
            confirmButtonText: 'Ya, hapus',
            cancelButtonText: 'Batal',
        });

        if (confirmation.isConfirmed) {
            router.delete(route('master-data.option-groups.destroy', group.code));
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kategori & Opsi" />

            <div className="flex flex-1 flex-col gap-4 p-4">
                <div className="flex justify-between">
                    <div>
                        <h1 className="text-xl font-semibold">Kategori & Opsi</h1>
                        <p className="text-sm text-muted-foreground">
                            Kelola pilihan dinamis yang dipakai di seluruh sistem (kategori alat, jenis kendaraan, prioritas tiket, dsb).
                        </p>
                    </div>

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button>Tambah Grup</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Tambah Grup Kategori</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={submit} className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="group_code">Kode (huruf/angka/garis bawah, unik)</Label>
                                    <Input id="group_code" value={data.code} onChange={(e) => setData('code', e.target.value)} />
                                    <InputError message={errors.code} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="group_name">Nama</Label>
                                    <Input id="group_name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                                    <InputError message={errors.name} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="group_description">Deskripsi (opsional)</Label>
                                    <Input
                                        id="group_description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                    />
                                    <InputError message={errors.description} />
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={processing}>
                                        Simpan
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="rounded-xl border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Kode</TableHead>
                                <TableHead>Nama</TableHead>
                                <TableHead className="text-right">Jumlah Opsi</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {groups.map((group) => (
                                <TableRow key={group.id}>
                                    <TableCell className="font-mono text-xs">{group.code}</TableCell>
                                    <TableCell>{group.name}</TableCell>
                                    <TableCell className="text-right">{group.options_count ?? 0}</TableCell>
                                    <TableCell>
                                        {group.is_locked ? (
                                            <Badge variant="outline">Bawaan Sistem</Badge>
                                        ) : (
                                            <Badge variant="secondary">Kustom</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button size="sm" variant="outline" asChild>
                                                <Link href={route('master-data.option-groups.show', group.code)}>Kelola Opsi</Link>
                                            </Button>
                                            {!group.is_locked && (
                                                <Button size="sm" variant="destructive" onClick={() => handleDelete(group)}>
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
