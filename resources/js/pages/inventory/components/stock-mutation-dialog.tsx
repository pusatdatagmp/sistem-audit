import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type KitchenInventory, type MasterDataOption } from '@/types';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useEffect } from 'react';

type Mode = 'in' | 'out';

interface StockMutationDialogProps {
    mode: Mode;
    inventory: KitchenInventory | null;
    conditionOptions: MasterDataOption[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function StockMutationDialog({ mode, inventory, conditionOptions, open, onOpenChange }: StockMutationDialogProps) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        kitchen_inventory_id: '',
        quantity: 1,
        condition_code: '',
        note: '',
    });

    useEffect(() => {
        if (open && inventory) {
            setData({
                kitchen_inventory_id: String(inventory.id),
                quantity: 1,
                condition_code: conditionOptions[0]?.code ?? '',
                note: '',
            });
            clearErrors();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, inventory]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        const url = mode === 'in' ? route('inventory.stock-in') : route('inventory.stock-out');

        post(url, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onOpenChange(false);
            },
        });
    };

    const title = mode === 'in' ? 'Stok Masuk' : 'Stok Keluar';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        {inventory?.kitchen_tool.name} &middot; {inventory?.kitchen.name}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="condition_code">Kondisi</Label>
                        <Select value={data.condition_code} onValueChange={(value) => setData('condition_code', value)}>
                            <SelectTrigger id="condition_code">
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
                        <Label htmlFor="quantity">Jumlah</Label>
                        <Input
                            id="quantity"
                            type="number"
                            min={1}
                            value={data.quantity}
                            onChange={(e) => setData('quantity', Number(e.target.value))}
                        />
                        <InputError message={errors.quantity} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="note">Catatan (opsional)</Label>
                        <Input id="note" value={data.note} onChange={(e) => setData('note', e.target.value)} />
                        <InputError message={errors.note} />
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={processing}>
                            Simpan
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
