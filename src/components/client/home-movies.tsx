'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { MoviesListMeta, PublicMovieListItem } from '@/lib/movies-public';
import { parseMoviesListResponse } from '@/lib/movies-public';
import { partitionMoviesForHome } from '@/lib/home-movie-sections';
import { toUserErrorMessage } from '@/lib/api-error';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

const HOME_PER_PAGE = 30;

function topLeftBadgeText(movie: PublicMovieListItem): string {
    const t = (movie.episode_current || '').trim();
    if (t) {
        return t.replace(/^hoàn tất/i, 'Hoàn tất');
    }
    if (movie.episode_total) {
        return String(movie.episode_total);
    }
    return movie.quality || 'HD';
}

/** Badge cyan góc dưới — theo status API */
function statusChip(movie: PublicMovieListItem): { label: string; className: string } {
    const s = (movie.status || '').toLowerCase();
    if (s === 'completed') {
        return { label: 'Hoàn thành', className: 'bg-cyan-600 text-white shadow-sm' };
    }
    if (s === 'ongoing') {
        return { label: 'Đang chiếu', className: 'bg-cyan-500 text-white shadow-sm' };
    }
    if (s === 'trailer') {
        return { label: 'Trailer', className: 'bg-sky-700/95 text-white shadow-sm' };
    }
    return { label: movie.status || '—', className: 'bg-cyan-600/90 text-white shadow-sm' };
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
            const url = `${API_URL}/movies?page=${page}&per_page=${HOME_PER_PAGE}`;
            const headers: HeadersInit = {
                Accept: 'application/json',
            };
            if (token) {
                (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch(url, { headers });
            const data = await res.json();

            if (!res.ok) {
                setError(toUserErrorMessage(data, { fallback: 'Hệ thống đang bận hoặc không kết nối được. Vui lòng thử lại sau.' }));
                setMovies([]);
                setMeta(undefined);
                return;
            }

            const { list, meta: m } = parseMoviesListResponse(data);
            if (process.env.NODE_ENV === 'development') {
                console.log('[HomeMovies]', { page, items: list.length, meta: m });
            }
            setMovies(list);
            setMeta(m);
        } catch (e) {
            console.error('[HomeMovies]', e);
            setError('Không kết nối được hệ thống. Vui lòng thử lại sau.');
            setMovies([]);
            setMeta(undefined);
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        fetchMovies();
    }, [fetchMovies]);

    const sections = useMemo(() => partitionMoviesForHome(movies), [movies]);

    if (loading) {
        return (
            <div className="flex min-h-[40vh] items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#e50914]" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-[1400px] px-3 pb-16 pt-6 text-zinc-100 sm:px-4">
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
                <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-8">
                    <main className="min-w-0 flex-1 space-y-12">

                        {sections.phimBo.length > 0 && (
                            <section aria-labelledby="section-phim-bo">
                                <SectionHeader id="section-phim-bo" title="PHIM BỘ" moreHref="/phim-bo" />
                                <MovieGrid items={sections.phimBo} />
                            </section>
                        )}

                        {sections.hoanTat.length > 0 && (
                            <section aria-labelledby="section-hoan-tat">
                                <SectionHeader id="section-hoan-tat" title="HOÀN TẤT" moreHref="/phim-bo" />
                                <MovieGrid items={sections.hoanTat} />
                            </section>
                        )}

                        {sections.phimLe.length > 0 && (
                            <section aria-labelledby="section-phim-le">
                                <SectionHeader id="section-phim-le" title="PHIM LẺ MỚI" moreHref="/phim-le" />
                                <MovieGrid items={sections.phimLe} />
                            </section>
                        )}

                        {sections.phimBo.length === 0 &&
                            sections.hoanTat.length === 0 &&
                            sections.phimLe.length === 0 && (
                                <section>
                                    <SectionHeader title="PHIM MỚI" moreHref="/" />
                                    <MovieGrid items={movies} />
                                </section>
                            )}
                    </main>

                    <aside className="w-full shrink-0 space-y-8 lg:w-72 xl:w-[320px]">
                        <SidebarBlock title="SẮP CHIẾU">
                            {sections.sapChieu.length === 0 ? (
                                <p className="py-4 text-center text-xs text-zinc-500">Chưa có phim sắp chiếu.</p>
                            ) : (
                                <ul className="divide-y divide-white/5 rounded-lg border border-white/10 bg-[#0d0d12]">
                                    {sections.sapChieu.slice(0, 10).map((m) => (
                                        <SidebarRow key={m.id} movie={m} />
                                    ))}
                                </ul>
                            )}
                        </SidebarBlock>

                        <SidebarBlock title="MỚI CẬP NHẬT">
                            {sections.moiCapNhat.length === 0 ? (
                                <p className="py-4 text-center text-xs text-zinc-500">—</p>
                            ) : (
                                <ul className="divide-y divide-white/5 rounded-lg border border-white/10 bg-[#0d0d12]">
                                    {sections.moiCapNhat.map((m) => (
                                        <SidebarRow key={m.id} movie={m} />
                                    ))}
                                </ul>
                            )}
                        </SidebarBlock>
                    </aside>
                </div>
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
        <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/10 pb-3">
            <h2
                id={id}
                className="flex items-center gap-2.5 text-base font-bold uppercase tracking-wide text-white sm:text-lg"
            >
                <span className="h-6 w-1 shrink-0 rounded-sm bg-[#e50914]" aria-hidden />
                {title}
            </h2>
            <Link
                href={moreHref}
                className="shrink-0 text-[11px] font-bold uppercase tracking-wide text-zinc-400 transition hover:text-[#e50914] sm:text-xs"
            >
                Xem thêm
            </Link>
        </div>
    );
}

function MovieGrid({ items }: { items: PublicMovieListItem[] }) {
    return (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
            {items.map((movie) => (
                <li key={movie.id}>
                    <MoviePosterCard movie={movie} />
                </li>
            ))}
        </ul>
    );
}

function MoviePosterCard({ movie }: { movie: PublicMovieListItem }) {
    const poster = movie.poster_url || movie.thumb_url;
    const chip = statusChip(movie);
    const topBadge = topLeftBadgeText(movie);
    const year = movie.year != null ? String(movie.year) : '';
    const subLine = [movie.origin_name, year].filter(Boolean).join(' · ');

    return (
        <Link
            href={`/phim/${movie.id}`}
            className="group block overflow-hidden rounded-[4px] border border-white/5 bg-[#0d0d12] shadow-md transition hover:border-[#e50914]/35 hover:shadow-lg hover:shadow-black/40"
        >
            <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-900">
                {poster ? (
                    // eslint-disable-next-line @next/next/no-img-element
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

                <div className="absolute left-0 top-2 z-10 max-w-[calc(100%-0.75rem)] pl-1.5">
                    <span className="inline-block max-w-full truncate rounded bg-[#c40000] px-2 py-0.5 text-[10px] font-bold uppercase leading-tight text-white shadow sm:text-[11px]">
                        {topBadge}
                    </span>
                </div>

                <div className="pointer-events-none absolute bottom-7 right-2 z-10">
                    <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase leading-none sm:text-[11px] ${chip.className}`}
                    >
                        {chip.label}
                    </span>
                </div>

                <div className="absolute inset-x-0 bottom-0 z-[5] bg-gradient-to-t from-black via-black/85 to-transparent px-2 pb-2.5 pt-16">
                    <h3 className="truncate text-[13px] font-bold leading-snug text-[#f5de7a] drop-shadow-md sm:text-sm md:text-[15px]">
                        {movie.name}
                    </h3>
                    {subLine ? (
                        <p className="mt-0.5 truncate text-[10px] leading-tight text-white/80 drop-shadow sm:text-[11px]">
                            {subLine}
                        </p>
                    ) : null}
                </div>
            </div>
        </Link>
    );
}

function SidebarBlock({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <h3 className="mb-3 flex items-center gap-2 border-b border-white/10 pb-2 text-sm font-bold uppercase tracking-wide text-white">
                <span className="h-5 w-1 shrink-0 rounded-sm bg-[#e50914]" aria-hidden />
                {title}
            </h3>
            {children}
        </div>
    );
}

function SidebarRow({ movie }: { movie: PublicMovieListItem }) {
    const thumb = movie.thumb_url || movie.poster_url;
    const year = movie.year != null ? String(movie.year) : '';
    const meta = [year, movie.quality].filter(Boolean).join(' · ');

    return (
        <li className="list-none">
            <Link
                href={`/phim/${movie.id}`}
                className="flex gap-3 px-2 py-2.5 transition hover:bg-white/[0.04]"
            >
                <div className="relative h-[4.5rem] w-12 shrink-0 overflow-hidden rounded bg-zinc-900">
                    {thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={thumb}
                            alt=""
                            className="h-full w-full object-cover"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                        />
                    ) : null}
                </div>
                <div className="min-w-0 flex-1 py-0.5">
                    <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-cyan-400 transition group-hover:text-cyan-300">
                        {movie.name}
                    </p>
                    {meta ? <p className="mt-1 text-[11px] text-zinc-500">{meta}</p> : null}
                </div>
            </Link>
        </li>
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
