import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFlashToast } from '@/hooks/use-flash-toast';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { ImageOff } from 'lucide-react';
import { FormEventHandler, useEffect, useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Pengaturan Sistem', href: '/system-settings' }];

const DEFAULT_COLOR = '#0f172a';

interface SystemSettingsEditProps {
    setting: {
        logo_url: string | null;
        primary_color: string | null;
    };
}

export default function SystemSettingsEdit({ setting }: SystemSettingsEditProps) {
    useFlashToast();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        logo: null as File | null,
        remove_logo: false as boolean,
        primary_color: setting.primary_color ?? '',
    });

    useEffect(() => {
        if (!data.logo) {
            setLogoPreview(null);
            return;
        }

        const url = URL.createObjectURL(data.logo);
        setLogoPreview(url);

        return () => URL.revokeObjectURL(url);
    }, [data.logo]);

    const currentLogoUrl = data.remove_logo ? null : (logoPreview ?? setting.logo_url);

    function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
        setData((prev) => ({ ...prev, logo: event.target.files?.[0] ?? null, remove_logo: false }));
    }

    function handleRemoveLogo() {
        setData((prev) => ({ ...prev, logo: null, remove_logo: true }));

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('system-settings.update'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => reset('logo', 'remove_logo'),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Pengaturan Sistem" />

            <div className="flex max-w-2xl flex-col gap-6 p-4">
                <div>
                    <h1 className="text-xl font-semibold">Pengaturan Sistem</h1>
                    <p className="text-muted-foreground text-sm">Atur logo dan warna tema yang berlaku untuk seluruh pengguna sistem.</p>
                </div>

                <form onSubmit={submit} className="flex flex-col gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Logo Aplikasi</CardTitle>
                            <CardDescription>Logo ini tampil di sidebar untuk semua pengguna. Format PNG/JPG/SVG/WebP, maks. 2MB.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <div className="flex items-center gap-4">
                                <div className="bg-muted flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border">
                                    {currentLogoUrl ? (
                                        <img src={currentLogoUrl} alt="Pratinjau logo" className="size-full object-contain" />
                                    ) : (
                                        <ImageOff className="text-muted-foreground size-6" />
                                    )}
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="logo">Unggah Logo Baru</Label>
                                    <Input
                                        id="logo"
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/png,image/jpeg,image/svg+xml,image/webp"
                                        onChange={handleFileChange}
                                    />
                                    <InputError message={errors.logo} />
                                </div>
                            </div>

                            {currentLogoUrl && (
                                <Button type="button" variant="outline" size="sm" className="w-fit" onClick={handleRemoveLogo}>
                                    Hapus Logo
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Warna Tema</CardTitle>
                            <CardDescription>Warna aksen utama untuk tombol, tautan aktif, dan elemen penting lainnya.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <Label htmlFor="primary_color">Warna Aksen</Label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={data.primary_color || DEFAULT_COLOR}
                                    onChange={(e) => setData('primary_color', e.target.value)}
                                    className="size-10 shrink-0 cursor-pointer rounded-md border p-1"
                                    aria-label="Pilih warna tema"
                                />
                                <Input
                                    id="primary_color"
                                    value={data.primary_color}
                                    onChange={(e) => setData('primary_color', e.target.value)}
                                    placeholder="Default (monokrom)"
                                    className="w-40 font-mono"
                                />
                                {data.primary_color && (
                                    <Button type="button" variant="ghost" size="sm" onClick={() => setData('primary_color', '')}>
                                        Gunakan Default
                                    </Button>
                                )}
                            </div>
                            <InputError message={errors.primary_color} />
                            <p className="text-muted-foreground text-xs">Perubahan warna berlaku setelah pengaturan ini disimpan.</p>
                        </CardContent>
                    </Card>

                    <Button type="submit" disabled={processing} className="w-fit">
                        Simpan Pengaturan
                    </Button>
                </form>
            </div>
        </AppLayout>
    );
}
