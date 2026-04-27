import Link from 'next/link';

function buildPages(current: number, last: number): Array<number | '…'> {
    const max = Math.max(1, last);
    const cur = Math.min(Math.max(1, current), max);
    const out: Array<number | '…'> = [];

    if (max <= 7) {
        for (let i = 1; i <= max; i++) out.push(i);
        return out;
    }

    out.push(1);
    const left = Math.max(2, cur - 1);
    const right = Math.min(max - 1, cur + 1);
    if (left > 2) out.push('…');
    for (let i = left; i <= right; i++) out.push(i);
    if (right < max - 1) out.push('…');
    out.push(max);
    return out;
}

export function ClientPagination({
    page,
    lastPage,
    hrefForPage,
}: {
    page: number;
    lastPage: number;
    hrefForPage: (page: number) => string;
}) {
    if (lastPage <= 1) return null;
    const canPrev = page > 1;
    const canNext = page < lastPage;
    const pages = buildPages(page, lastPage);

    const btnBase =
        'inline-flex min-w-9 items-center justify-center rounded border px-3 py-2 text-sm transition';
    const btnIdle = 'border-zinc-700 bg-zinc-900/60 text-zinc-200 hover:border-[#e50914]/50 hover:bg-zinc-900';
    const btnActive = 'border-[#e50914] bg-[#e50914] font-semibold text-white';
    const iconBtn =
        'inline-flex h-9 w-9 items-center justify-center rounded border border-zinc-700 bg-zinc-900/60 text-zinc-200 transition hover:border-[#e50914]/50 hover:bg-zinc-900';
    const iconBtnDisabled = 'opacity-40 pointer-events-none';

    return (
        <nav className="mt-10 flex w-full items-center justify-center gap-2" aria-label="Phân trang">
            <Link
                href={hrefForPage(Math.max(1, page - 1))}
                aria-disabled={!canPrev}
                className={[iconBtn, !canPrev ? iconBtnDisabled : ''].join(' ')}
                title="Trang trước"
            >
                ‹
            </Link>

            {pages.map((p, idx) =>
                p === '…' ? (
                    <span key={`e-${idx}`} className="px-1 text-sm text-zinc-500">
                        …
                    </span>
                ) : (
                    <Link
                        key={p}
                        href={hrefForPage(p)}
                        className={[btnBase, p === page ? btnActive : btnIdle].join(' ')}
                    >
                        {p}
                    </Link>
                ),
            )}

            <Link
                href={hrefForPage(Math.min(lastPage, page + 1))}
                aria-disabled={!canNext}
                className={[iconBtn, !canNext ? iconBtnDisabled : ''].join(' ')}
                title="Trang sau"
            >
                ›
            </Link>
        </nav>
    );
}

