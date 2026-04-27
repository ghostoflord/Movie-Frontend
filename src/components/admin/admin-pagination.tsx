import type { ReactNode } from 'react';

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

export function AdminPagination({
    page,
    lastPage,
    onPageChange,
    perPage,
    perPageOptions = [10, 20, 50, 100],
    onPerPageChange,
    leftSlot,
    rightSlot,
}: {
    page: number;
    lastPage: number;
    onPageChange: (page: number) => void;
    perPage?: number;
    perPageOptions?: number[];
    onPerPageChange?: (perPage: number) => void;
    leftSlot?: ReactNode;
    rightSlot?: ReactNode;
}) {
    const canPrev = page > 1;
    const canNext = page < lastPage;
    const pages = buildPages(page, lastPage);

    return (
        <nav className="flex flex-wrap items-center justify-between gap-3" aria-label="Phân trang">
            <div className="flex items-center gap-2">
                {leftSlot ?? null}
            </div>

            <div className="flex items-center justify-center gap-2">
                <button
                    type="button"
                    disabled={!canPrev}
                    onClick={() => onPageChange(Math.max(1, page - 1))}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/40 text-zinc-200 transition hover:bg-zinc-900 disabled:opacity-50"
                    aria-label="Trang trước"
                    title="Trang trước"
                >
                    <span aria-hidden>‹</span>
                </button>

                <div className="flex items-center gap-2">
                    {pages.map((p, idx) =>
                        p === '…' ? (
                            <span key={`e-${idx}`} className="px-1 text-sm text-zinc-500">
                                …
                            </span>
                        ) : (
                            <button
                                key={p}
                                type="button"
                                onClick={() => onPageChange(p)}
                                className={[
                                    'min-w-10 rounded-xl border px-3 py-2 text-sm transition',
                                    p === page
                                        ? 'border-red-500/40 bg-red-500/10 text-white'
                                        : 'border-zinc-700 bg-zinc-900/40 text-zinc-200 hover:bg-zinc-900',
                                ].join(' ')}
                            >
                                {p}
                            </button>
                        ),
                    )}
                </div>

                <button
                    type="button"
                    disabled={!canNext}
                    onClick={() => onPageChange(Math.min(lastPage, page + 1))}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/40 text-zinc-200 transition hover:bg-zinc-900 disabled:opacity-50"
                    aria-label="Trang sau"
                    title="Trang sau"
                >
                    <span aria-hidden>›</span>
                </button>
            </div>

            <div className="flex items-center gap-3">
                {rightSlot ?? (
                    <div className="text-sm text-zinc-500">
                        Trang {page} / {lastPage}
                    </div>
                )}

                {typeof perPage === 'number' && onPerPageChange ? (
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-zinc-500" htmlFor="admin-per-page">
                            / page
                        </label>
                        <select
                            id="admin-per-page"
                            value={perPage}
                            onChange={(e) => onPerPageChange(Number(e.target.value))}
                            className="h-10 rounded-xl border border-zinc-700 bg-zinc-900/40 px-3 text-sm text-zinc-200 outline-none transition focus:border-red-500/50"
                        >
                            {perPageOptions.map((n) => (
                                <option key={n} value={n}>
                                    {n}
                                </option>
                            ))}
                        </select>
                    </div>
                ) : null}
            </div>
        </nav>
    );
}

