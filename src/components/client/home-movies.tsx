'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { MoviesListMeta, PublicMovieListItem } from '@/lib/movies-public';

/** Giống admin/movies/page.tsx — base đã có /api */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

function parseMoviesPayload(data: unknown): { list: PublicMovieListItem[]; meta?: MoviesListMeta } {
    if (Array.isArray(data)) {
        return { list: data as PublicMovieListItem[] };
    }
    if (data && typeof data === 'object') {
        const o = data as Record<string, unknown>;

        // Laravel / wrapper: { data: { data: [], meta: {} } }
        if (o.data != null && typeof o.data === 'object' && !Array.isArray(o.data)) {
            const inner = o.data as Record<string, unknown>;
            if (Array.isArray(inner.data)) {
                return {
                    list: inner.data as PublicMovieListItem[],
                    meta: (inner.meta ?? o.meta) as MoviesListMeta | undefined,
                };
            }
        }

        if (Array.isArray(o.data)) {
            return {
                list: o.data as PublicMovieListItem[],
                meta: o.meta as MoviesListMeta | undefined,
            };
        }
        if (Array.isArray(o.movies)) {
            return { list: o.movies as PublicMovieListItem[], meta: o.meta as MoviesListMeta | undefined };
        }
        if ('id' in o && o.id != null) {
            return { list: [data as PublicMovieListItem] };
        }
    }
    return { list: [] };
}

/** Badge góc trên trái: ưu tiên episode_current (vd Hoàn tất (7/7), Tập 18) */
function topLeftBadgeText(movie: PublicMovieListItem): string {
    const t = (movie.episode_current || '').trim();
    if (t) {
        return t.replace(/^hoàn tất/i, 'Hoàn Tất');
    }
    if (movie.episode_total) {
        return movie.episode_total;
    }
    return movie.quality || 'HD';
}

function statusChip(movie: PublicMovieListItem): { label: string; className: string } {
    const s = (movie.status || '').toLowerCase();
    if (s === 'completed') {
        return { label: 'Hoàn thành', className: 'bg-sky-600 text-white shadow-sm' };
    }
    if (s === 'ongoing') {
        return { label: 'Đang chiếu', className: 'bg-amber-600/95 text-white shadow-sm' };
    }
    if (s === 'trailer') {
        return { label: 'Trailer', className: 'bg-zinc-600 text-white shadow-sm' };
    }
    return { label: movie.status || '—', className: 'bg-sky-600/90 text-white shadow-sm' };
}

export default function HomeMovies() {
    const searchParams = useSearchParams();
    const pageRaw = searchParams.get('page') || '1';
    const page = Math.max(1, parseInt(pageRaw, 10) || 1);

    const [movies, setMovies] = useState<PublicMovieListItem[]>([]);
    const [meta, setMeta] = useState<MoviesListMeta | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMovies = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            const url = `${API_URL}/movies?page=${page}`;
            const headers: HeadersInit = {
                Accept: 'application/json',
            };
            if (token) {
                (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch(url, { headers });
            const data = await res.json();

            if (!res.ok) {
                setError(typeof data?.message === 'string' ? data.message : `Lỗi ${res.status}`);
                setMovies([]);
                setMeta(undefined);
                return;
            }

            const { list, meta: m } = parseMoviesPayload(data);
            if (process.env.NODE_ENV === 'development') {
                console.log('[HomeMovies]', { page, items: list.length, meta: m });
            }
            setMovies(list);
            setMeta(m);
        } catch (e) {
            console.error('[HomeMovies]', e);
            setError('Không kết nối được API. Kiểm tra NEXT_PUBLIC_API_URL và backend.');
            setMovies([]);
            setMeta(undefined);
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchMovies();
    }, [fetchMovies]);

    if (loading) {
        return (
            <div className="flex min-h-[40vh] items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#e50914]" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-6 text-zinc-100">
            {error && (
                <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center text-sm text-red-200">
                    {error}
                </div>
            )}

            {!error && movies.length === 0 && (
                <p className="text-center text-zinc-400">
                    Chưa có phim trên trang này (API trả về danh sách rỗng hoặc định dạng khác).
                </p>
            )}

            {movies.length > 0 && (
                <section aria-labelledby="section-phim-bo">
                    <SectionHeader
                        id="section-phim-bo"
                        title="PHIM BỘ"
                        moreHref="/phim-bo"
                    />

                    {meta ? (
                        <p className="mb-4 text-xs text-zinc-500">
                            Trang {meta.current_page} / {meta.last_page} · {meta.total} phim
                        </p>
                    ) : null}

                    <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5">
                        {movies.map((movie) => (
                            <li key={movie.id}>
                                <MoviePosterCard movie={movie} />
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {meta && meta.last_page > 1 && (
                <nav
                    className="mt-10 flex flex-wrap items-center justify-center gap-2"
                    aria-label="Phân trang"
                >
                    <PaginationLink disabled={meta.current_page <= 1} page={meta.current_page - 1}>
                        ← Trước
                    </PaginationLink>
                    <span className="px-3 text-sm text-zinc-400">
                        Trang {meta.current_page} / {meta.last_page}
                    </span>
                    <PaginationLink disabled={meta.current_page >= meta.last_page} page={meta.current_page + 1}>
                        Sau →
                    </PaginationLink>
                </nav>
            )}
        </div>
    );
}

function SectionHeader({
    id,
    title,
    moreHref,
}: {
    id?: string;
    title: string;
    moreHref: string;
}) {
    return (
        <div className="mb-4 flex items-center justify-between gap-3">
            <h2
                id={id}
                className="inline-flex items-center bg-[#e50914] px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide text-white shadow-[0_2px_8px_rgba(229,9,20,0.35)] sm:px-4 sm:py-2 sm:text-sm"
            >
                {title}
            </h2>
            <Link
                href={moreHref}
                className="shrink-0 text-xs font-bold uppercase tracking-wide text-zinc-100 transition hover:text-[#e50914] sm:text-sm"
            >
                Xem thêm
            </Link>
        </div>
    );
}

function MoviePosterCard({ movie }: { movie: PublicMovieListItem }) {
    const poster = movie.thumb_url || movie.poster_url;
    const chip = statusChip(movie);
    const topBadge = topLeftBadgeText(movie);

    return (
        <Link
            href={`/phim/${movie.slug}`}
            className="group block overflow-hidden rounded-[4px] border border-white/5 bg-[#0d0d12] shadow-md transition hover:border-[#e50914]/35 hover:shadow-lg hover:shadow-black/40"
        >
            <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-900">
                {poster ? (
                    // eslint-disable-next-line @next/next/no-img-element -- ảnh domain ngoài, tránh lỗi Next/Image
                    <img
                        src={poster}
                        alt={movie.name}
                        className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                        referrerPolicy="no-referrer"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-[10px] text-white/35">No image</div>
                )}

                {/* Badge đỏ góc trên trái — tập / hoàn tất */}
                <div className="absolute left-2 top-2 z-10 max-w-[calc(100%-1rem)]">
                    <span className="inline-block max-w-full truncate rounded bg-[#c40000] px-1.5 py-0.5 text-[10px] font-semibold uppercase leading-tight text-white shadow sm:text-[11px]">
                        {topBadge}
                    </span>
                </div>

                {/* Gradient + tiêu đề + badge trạng thái (xanh) phía trên dòng tên */}
                <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/95 via-black/55 to-transparent px-2 pb-2.5 pt-14">
                    <div className="mb-1.5 flex justify-end">
                        <span
                            className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase leading-none sm:text-[11px] ${chip.className}`}
                        >
                            {chip.label}
                        </span>
                    </div>
                    <h3 className="truncate text-sm font-bold leading-tight text-white drop-shadow-md sm:text-[15px]">
                        {movie.name}
                    </h3>
                    {movie.origin_name ? (
                        <p className="mt-0.5 truncate text-[11px] italic leading-tight text-white/90 drop-shadow sm:text-xs">
                            {movie.origin_name}
                        </p>
                    ) : null}
                </div>
            </div>
        </Link>
    );
}

function PaginationLink({
    page,
    disabled,
    children,
}: {
    page: number;
    disabled: boolean;
    children: React.ReactNode;
}) {
    if (disabled) {
        return (
            <span className="cursor-not-allowed rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-600">
                {children}
            </span>
        );
    }
    return (
        <Link
            href={`/?page=${page}`}
            className="rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2 text-sm text-zinc-100 transition hover:border-[#e50914]/60 hover:bg-zinc-700"
        >
            {children}
        </Link>
    );
}
