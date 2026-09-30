import { Button } from '@/components/ui/button';
import { type Paginated } from '@/types';
import { Link } from '@inertiajs/react';

interface PaginationFooterProps<T> {
    paginated: Paginated<T>;
}

export default function PaginationFooter<T>({ paginated }: PaginationFooterProps<T>) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
                {paginated.total > 0
                    ? `Menampilkan ${paginated.from}-${paginated.to} dari ${paginated.total} data`
                    : 'Tidak ada data untuk ditampilkan'}
            </p>

            {paginated.last_page > 1 && (
                <div className="flex flex-wrap gap-1">
                    {paginated.links.map((link, index) => (
                        <Button key={index} size="sm" variant={link.active ? 'default' : 'outline'} disabled={!link.url} asChild={!!link.url}>
                            {link.url ? (
                                <Link href={link.url} preserveScroll dangerouslySetInnerHTML={{ __html: link.label }} />
                            ) : (
                                <span dangerouslySetInnerHTML={{ __html: link.label }} />
                            )}
                        </Button>
                    ))}
                </div>
            )}
        </div>
    );
}
