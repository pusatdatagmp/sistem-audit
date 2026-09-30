import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type KitchenInventory } from '@/types';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect } from 'react';
import Swal from 'sweetalert2';

interface OpnameDialogProps {
    inventory: KitchenInventory | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

// Laravel validation returns dot-path keys (e.g. "counted.baik") for nested fields,
// which doesn't match useForm's `keyof TForm` error typing.
type FlatErrors = Record<string, string | undefined>;

export default function OpnameDialog({ inventory, open, onOpenChange }: OpnameDialogProps) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        kitchen_inventory_id: '',
        counted: {
            baik: 0,
            'perlu-perbaikan': 0,
            'rusak-berat': 0,
        },
        note: '',
    });

    useEffect(() => {
        if (open && inventory) {
            setData({
                kitchen_inventory_id: String(inventory.id),
                counted: {
                    baik: inventory.quantity_good,
                    'perlu-perbaikan': inventory.quantity_needs_repair,
                    'rusak-berat': inventory.quantity_damaged,
                },
                note: '',
            });
            clearErrors();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, inventory]);

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();

        const confirmation = await Swal.fire({
            icon: 'warning',
            title: 'Konfirmasi stock opname',
            text: 'Jumlah stok akan disesuaikan dengan hasil hitung fisik ini. Lanjutkan?',
            showCancelButton: true,
            confirmButtonText: 'Ya, simpan',
            cancelButtonText: 'Batal',
        });

        if (!confirmation.isConfirmed) {
            return;
        }

        post(route('inventory.opname'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onOpenChange(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Stock Opname</DialogTitle>
                    <DialogDescription>
                        {inventory?.kitchen_tool.name} &middot; {inventory?.kitchen.name}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="counted_baik">Baik</Label>
                        <Input
                            id="counted_baik"
                            type="number"
                            min={0}
                            value={data.counted.baik}
                            onChange={(e) => setData('counted', { ...data.counted, baik: Number(e.target.value) })}
                        />
                        <InputError message={(errors as FlatErrors)['counted.baik']} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="counted_needs_repair">Perlu Perbaikan</Label>
                        <Input
                            id="counted_needs_repair"
                            type="number"
                            min={0}
                            value={data.counted['perlu-perbaikan']}
                            onChange={(e) => setData('counted', { ...data.counted, 'perlu-perbaikan': Number(e.target.value) })}
                        />
                        <InputError message={(errors as FlatErrors)['counted.perlu-perbaikan']} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="counted_damaged">Rusak Berat</Label>
                        <Input
                            id="counted_damaged"
                            type="number"
                            min={0}
                            value={data.counted['rusak-berat']}
                            onChange={(e) => setData('counted', { ...data.counted, 'rusak-berat': Number(e.target.value) })}
                        />
                        <InputError message={(errors as FlatErrors)['counted.rusak-berat']} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="opname_note">Catatan (opsional)</Label>
                        <Input id="opname_note" value={data.note} onChange={(e) => setData('note', e.target.value)} />
                        <InputError message={errors.note} />
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={processing}>
                            Simpan Hasil Opname
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
