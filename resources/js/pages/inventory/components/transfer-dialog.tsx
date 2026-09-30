import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type Kitchen, type KitchenInventory, type MasterDataOption } from '@/types';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect } from 'react';
import Swal from 'sweetalert2';

interface TransferDialogProps {
    inventory: KitchenInventory | null;
    kitchens: Kitchen[];
    conditionOptions: MasterDataOption[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function TransferDialog({ inventory, kitchens, conditionOptions, open, onOpenChange }: TransferDialogProps) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        from_kitchen_id: '',
        to_kitchen_id: '',
        kitchen_tool_id: '',
        quantity: 1,
        condition_code: '',
        note: '',
    });

    useEffect(() => {
        if (open && inventory) {
            setData({
                from_kitchen_id: String(inventory.kitchen_id),
                to_kitchen_id: '',
                kitchen_tool_id: String(inventory.kitchen_tool_id),
                quantity: 1,
                condition_code: conditionOptions[0]?.code ?? '',
                note: '',
            });
            clearErrors();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, inventory]);

    const submit: FormEventHandler = async (e) => {
        e.preventDefault();

        const destination = kitchens.find((k) => String(k.id) === data.to_kitchen_id);

        const confirmation = await Swal.fire({
            icon: 'question',
            title: 'Konfirmasi transfer stok',
            text: `Pindahkan ${data.quantity} unit ke ${destination?.name ?? 'dapur tujuan'}?`,
            showCancelButton: true,
            confirmButtonText: 'Ya, transfer',
            cancelButtonText: 'Batal',
        });

        if (!confirmation.isConfirmed) {
            return;
        }

        post(route('inventory.transfer'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onOpenChange(false);
            },
        });
    };

    const destinationOptions = kitchens.filter((k) => String(k.id) !== data.from_kitchen_id);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Transfer Stok Antar Dapur</DialogTitle>
                    <DialogDescription>
                        {inventory?.kitchen_tool.name} &middot; dari {inventory?.kitchen.name}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="to_kitchen_id">Dapur Tujuan</Label>
                        <Select value={data.to_kitchen_id} onValueChange={(value) => setData('to_kitchen_id', value)}>
                            <SelectTrigger id="to_kitchen_id">
                                <SelectValue placeholder="Pilih dapur tujuan" />
                            </SelectTrigger>
                            <SelectContent>
                                {destinationOptions.map((kitchen) => (
                                    <SelectItem key={kitchen.id} value={String(kitchen.id)}>
                                        {kitchen.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.to_kitchen_id} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="transfer_condition_code">Kondisi</Label>
                        <Select value={data.condition_code} onValueChange={(value) => setData('condition_code', value)}>
                            <SelectTrigger id="transfer_condition_code">
                                <SelectValue placeholder="Pilih kondisi" />
                            </SelectTrigger>
                            <SelectContent>
                                {conditionOptions.map((option) => (
                                    <SelectItem key={option.id} value={option.code}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <InputError message={errors.condition_code} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="transfer_quantity">Jumlah</Label>
                        <Input
                            id="transfer_quantity"
                            type="number"
                            min={1}
                            value={data.quantity}
                            onChange={(e) => setData('quantity', Number(e.target.value))}
                        />
                        <InputError message={errors.quantity} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="transfer_note">Catatan (opsional)</Label>
                        <Input id="transfer_note" value={data.note} onChange={(e) => setData('note', e.target.value)} />
                        <InputError message={errors.note} />
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={processing || !data.to_kitchen_id}>
                            Transfer
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
