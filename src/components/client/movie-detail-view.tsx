'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { PublicMovieDetail, PublicMovieEpisode } from '@/types/public-movie-detail';
import type { PublicMovieListItem } from '@/lib/movies-public';
import { partitionMoviesForHome } from '@/lib/home-movie-sections';
import { toUserErrorMessage } from '@/lib/api-error';
import { ratingAPI } from '@/lib/api';

function PlayIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M8 5v14l11-7z" />
        </svg>
    );
}

function HomeCrumbIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z" />
        </svg>
    );
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
const LIST_PER_PAGE = 40;

function unwrapMovie(json: unknown): PublicMovieDetail | null {
    if (!json || typeof json !== 'object') return null;
    const o = json as Record<string, unknown>;
    if (o.data && typeof o.data === 'object') {
        return o.data as PublicMovieDetail;
    }
    if ('id' in o && 'name' in o) {
        return o as PublicMovieDetail;
    }
    return null;
}

function parseListPayload(data: unknown): PublicMovieListItem[] {
    if (Array.isArray(data)) return data as PublicMovieListItem[];
    if (data && typeof data === 'object') {
        const o = data as Record<string, unknown>;
        if (o.data != null && typeof o.data === 'object' && !Array.isArray(o.data)) {
            const inner = o.data as Record<string, unknown>;
            if (Array.isArray(inner.data)) return inner.data as PublicMovieListItem[];
        }
        if (Array.isArray(o.data)) return o.data as PublicMovieListItem[];
        if (Array.isArray(o.movies)) return o.movies as PublicMovieListItem[];
    }
    return [];
}

function formatCategories(cats: string[] | null | undefined): string[] {
    if (!cats?.length) return [];
    return cats.filter(Boolean);
}

function formatPeople(people: string[] | null | undefined): string {
    if (!people?.length) return '';
    return people.filter((p) => p && String(p).trim()).join(', ');
}

function isHtmlDescription(s: string): boolean {
    return /<[a-z][\s\S]*>/i.test(s);
}

function statusLabelVi(status: string): string {
    const s = (status || '').toLowerCase();
    if (s === 'completed') return 'Hoàn thành';
    if (s === 'ongoing') return 'Đang chiếu';
    if (s === 'trailer') return 'Trailer';
    return status || '—';
}

function topLeftBadgeText(movie: PublicMovieListItem): string {
    const t = (movie.episode_current || '').trim();
    if (t) return t.replace(/^hoàn tất/i, 'Hoàn tất');
    if (movie.episode_total) return String(movie.episode_total);
    return movie.quality || 'HD';
}

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

function MetaRow({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-wrap gap-x-2 border-b border-white/5 py-1.5 text-sm last:border-0 md:grid md:grid-cols-[140px_1fr] md:gap-4">
            <span className="font-semibold text-amber-300/95">{label}</span>
            <span className="min-w-0 text-zinc-200">{children}</span>
        </div>
    );
}

function RelatedMovieCard({ movie }: { movie: PublicMovieListItem }) {
    const poster = movie.poster_url || movie.thumb_url;
    const chip = statusChip(movie);
    const topBadge = topLeftBadgeText(movie);
    const year = movie.year != null ? String(movie.year) : '';

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
                <div className="absolute inset-x-0 bottom-0 z-[5] bg-gradient-to-t from-black via-black/85 to-transparent px-2 pb-2.5 pt-14">
                    <h3 className="truncate text-[12px] font-bold leading-snug text-[#f5de7a] drop-shadow sm:text-[13px]">
                        {movie.name}
                    </h3>
                    {year ? (
                        <p className="mt-0.5 truncate text-[10px] text-white/80 sm:text-[11px]">({year})</p>
                    ) : null}
                </div>
            </div>
        </Link>
    );
}

function DetailSidebarBlock({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="overflow-hidden rounded-lg border border-white/10 bg-[#0d0d12]">
            <div className="bg-[#c40000] px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-white sm:text-sm">
                {title}
            </div>
            <div className="divide-y divide-white/5">{children}</div>
        </div>
    );
}

function DetailSidebarRow({ movie }: { movie: PublicMovieListItem }) {
    const thumb = movie.thumb_url || movie.poster_url;
    const year = movie.year != null ? String(movie.year) : '';
    const meta = [year, movie.quality].filter(Boolean).join(' · ');

    return (
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
                <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-cyan-400 hover:text-cyan-300">
                    {movie.name}
                </p>
                {meta ? <p className="mt-1 text-[11px] text-zinc-500">{meta}</p> : null}
            </div>
        </Link>
    );
}

export default function MovieDetailView({ movieId }: { movieId: string }) {
    const [movie, setMovie] = useState<PublicMovieDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedEpisode, setSelectedEpisode] = useState<PublicMovieEpisode | null>(null);
    const [listMovies, setListMovies] = useState<PublicMovieListItem[]>([]);
    const [myRatingId, setMyRatingId] = useState<number | null>(null);
    const [myRating, setMyRating] = useState<number>(0); // 0..10
    const [ratingHover, setRatingHover] = useState<number | null>(null);
    const [ratingSaving, setRatingSaving] = useState(false);
    const [ratingNotice, setRatingNotice] = useState<string | null>(null);

    const fetchMovie = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            const headers: HeadersInit = { Accept: 'application/json' };
            if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;

            const res = await fetch(`${API_URL}/movies/${movieId}`, { headers });
            const json = await res.json();
            if (!res.ok) {
                setError(toUserErrorMessage(json, { fallback: 'Hệ thống đang bận hoặc không kết nối được. Vui lòng thử lại sau.' }));
                setMovie(null);
                return;
            }
            const m = unwrapMovie(json);
            setMovie(m);
            if (m?.episodes?.length) {
                const sorted = [...m.episodes].sort((a, b) => b.episode_number - a.episode_number);
                setSelectedEpisode(sorted[0] ?? m.episodes[0]);
            }
        } catch (e) {
            console.error(e);
            setError('Không tải được phim. Vui lòng thử lại sau.');
            setMovie(null);
        } finally {
            setLoading(false);
        }
    }, [movieId]);

    useEffect(() => {
        fetchMovie();
    }, [fetchMovie]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                if (!token) {
                    if (!cancelled) {
                        setMyRatingId(null);
                        setMyRating(0);
                    }
                    return;
                }
                const list = await ratingAPI.list(); // chỉ rating của user đang login
                const mid = Number(movieId);
                const mine = list.find((r) => r && typeof r === 'object' && (r as any).movie_id === mid);
                if (!cancelled) {
                    setMyRatingId(mine?.id ?? null);
                    setMyRating(Number(mine?.rating ?? 0) || 0);
                }
            } catch {
                if (!cancelled) {
                    setMyRatingId(null);
                    setMyRating(0);
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [movieId]);

    const canRate = typeof window !== 'undefined' && !!localStorage.getItem('token');

    const saveRating = async (value: number) => {
        if (!canRate) return;
        const v = Math.max(1, Math.min(10, value));
        setRatingSaving(true);
        setRatingNotice(null);
        try {
            const r = await ratingAPI.create({ movie_id: Number(movieId), rating: v });
            setMyRatingId(r?.id ?? myRatingId);
            setMyRating(v);
            setRatingNotice('Đã lưu đánh giá.');
        } catch (e) {
            setRatingNotice(
                toUserErrorMessage((e as any)?.response?.data ?? (e as any)?.message, {
                    fallback: 'Không lưu được đánh giá.',
                }),
            );
        } finally {
            setRatingSaving(false);
        }
    };
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                const headers: HeadersInit = { Accept: 'application/json' };
                if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
                const res = await fetch(`${API_URL}/movies?page=1&per_page=${LIST_PER_PAGE}`, { headers });
                if (!res.ok) return;
                const json = await res.json();
                if (cancelled) return;
                setListMovies(parseListPayload(json));
            } catch {
                if (!cancelled) setListMovies([]);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const refreshEpisodeEmbed = async (ep: PublicMovieEpisode) => {
        setSelectedEpisode(ep);
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            const headers: HeadersInit = { Accept: 'application/json' };
            if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
            const res = await fetch(`${API_URL}/episodes/${ep.id}`, { headers });
            if (!res.ok) return;
            const json = await res.json();
            const raw = json?.data ?? json;
            if (raw && typeof raw === 'object' && 'embed_url' in raw) {
                setSelectedEpisode({ ...ep, embed_url: String((raw as PublicMovieEpisode).embed_url ?? '') });
            }
        } catch {
            /* dùng embed từ movie */
        }
    };

    const episodesSorted = useMemo(() => {
        if (!movie?.episodes?.length) return [];
        return [...movie.episodes].sort((a, b) => b.episode_number - a.episode_number);
    }, [movie]);

    const sidebarSections = useMemo(() => partitionMoviesForHome(listMovies), [listMovies]);

    const relatedMovies = useMemo(() => {
        const id = Number(movieId);
        return listMovies.filter((m) => m.id !== id).slice(0, 15);
    }, [listMovies, movieId]);

    const scrollToPlayer = () => {
        document.getElementById('watch-player')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const playFirst = () => {
        if (episodesSorted[0]) {
            void refreshEpisodeEmbed(episodesSorted[0]);
        }
        scrollToPlayer();
    };

    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center bg-black">
                <div className="h-12 w-12 animate-spin rounded-full border-2 border-zinc-800 border-t-[#e50914]" />
            </div>
        );
    }

    if (error || !movie) {
        return (
            <div className="mx-auto max-w-lg px-4 py-20 text-center text-zinc-300">
                <p className="text-lg">{error || 'Không tìm thấy phim.'}</p>
                <Link href="/" className="mt-6 inline-block text-[#e50914] hover:underline">
                    ← Về trang chủ
                </Link>
            </div>
        );
    }

    const poster = movie.poster_url || movie.thumb_url;
    const categories = formatCategories(movie.categories);
    const actors = formatPeople(movie.actors);
    const directors = formatPeople(movie.directors);
    const desc = movie.description || '';
    const descIsHtml = isHtmlDescription(desc);
    const yearStr = movie.year != null ? String(movie.year) : '—';
    const country = movie.country?.trim() || '—';
    const genresText = categories.length ? categories.join(', ') : '—';
    const viewLine =
        movie.view_count != null && movie.view_count >= 0
            ? `${movie.view_count.toLocaleString('vi-VN')} lượt xem`
            : '—';
    const durationLine = movie.duration?.trim() || '—';

    return (
        <div className="min-h-screen bg-black text-zinc-100">
            <div className="mx-auto max-w-[1400px] px-3 pb-16 pt-4 sm:px-4 sm:pt-6">
                <nav className="mb-6 flex flex-wrap items-center gap-1 text-sm text-zinc-500">
                    <Link href="/" className="text-zinc-400 transition hover:text-amber-300" aria-label="Trang chủ">
                        <HomeCrumbIcon className="inline-block h-4 w-4 align-text-bottom" />
                    </Link>
                    <span aria-hidden className="text-zinc-600">
                        {' '}
                        »{' '}
                    </span>
                    <Link href="/" className="text-zinc-400 transition hover:text-amber-300">
                        Xem phim
                    </Link>
                    <span aria-hidden className="text-zinc-600">
                        {' '}
                        »{' '}
                    </span>
                    <span className="font-medium text-amber-300/90">{movie.name}</span>
                </nav>

                <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-8">
                    <div className="min-w-0 flex-1 lg:max-w-[75%]">
                        <div className="flex flex-col gap-6 md:flex-row md:gap-8">
                            <div className="mx-auto w-full max-w-[200px] shrink-0 md:mx-0 md:max-w-[220px]">
                                <div className="overflow-hidden rounded-lg border border-white/10 bg-zinc-900 shadow-xl">
                                    {poster ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={poster}
                                            alt={movie.name}
                                            className="aspect-[2/3] w-full object-cover"
                                            referrerPolicy="no-referrer"
                                        />
                                    ) : (
                                        <div className="flex aspect-[2/3] items-center justify-center text-zinc-600">
                                            No poster
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={playFirst}
                                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#e50914] py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#ff0f1a]"
                                >
                                    <PlayIcon className="h-4 w-4" />
                                    Xem phim
                                </button>
                            </div>

                            <div className="min-w-0 flex-1">
                                <h1 className="text-2xl font-bold uppercase leading-tight text-amber-300 md:text-3xl">
                                    {movie.name}
                                </h1>
                                <p className="mt-2 text-base text-white md:text-lg">
                                    {movie.origin_name}
                                    {yearStr !== '—' ? ` (${yearStr})` : ''}
                                </p>

                                <div className="mt-3 flex flex-wrap items-center gap-2 text-zinc-600">
                                    <div
                                        className="flex items-center gap-0.5"
                                        onMouseLeave={() => setRatingHover(null)}
                                    >
                                        {Array.from({ length: 5 }, (_, i) => i + 1).map((star) => {
                                            const value10 = star * 2; // 2..10
                                            const displayValue = ratingHover ?? myRating;
                                            const filled = displayValue >= value10;
                                            return (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    disabled={!canRate || ratingSaving}
                                                    onMouseEnter={() => setRatingHover(value10)}
                                                    onFocus={() => setRatingHover(value10)}
                                                    onClick={() => void saveRating(value10)}
                                                    className={[
                                                        'rounded p-0.5 transition',
                                                        canRate ? 'hover:text-amber-200' : 'cursor-default',
                                                        filled ? 'text-amber-300' : 'text-zinc-700',
                                                        ratingSaving ? 'opacity-70' : '',
                                                    ].join(' ')}
                                                    aria-label={`Đánh giá ${value10}/10`}
                                                >
                                                    <span className="text-lg leading-none">★</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <span className="ml-1 text-xs text-zinc-500">
                                        {(myRating || 0)} / 10
                                    </span>
                                    {!canRate ? (
                                        <Link href="/login" className="ml-2 text-xs font-semibold text-[#e50914] hover:underline">
                                            Đăng nhập để đánh giá
                                        </Link>
                                    ) : (
                                        <span className="ml-2 text-xs text-zinc-600">
                                            {myRatingId ? 'Đã đánh giá' : 'Chưa đánh giá'}
                                        </span>
                                    )}
                                    {ratingNotice ? (
                                        <span className="w-full text-xs text-zinc-400">{ratingNotice}</span>
                                    ) : null}
                                </div>

                                <div className="mt-5 space-y-0 border-t border-white/10 pt-3">
                                    <MetaRow label="Trạng thái:">
                                        <span className="font-medium text-[#e50914]">{statusLabelVi(movie.status)}</span>
                                    </MetaRow>
                                    <MetaRow label="Thể loại:">{genresText}</MetaRow>
                                    <MetaRow label="Quốc gia:">{country}</MetaRow>
                                    <MetaRow label="Năm:">{yearStr}</MetaRow>
                                    <MetaRow label="Đạo diễn:">{directors || '—'}</MetaRow>
                                    <MetaRow label="Diễn viên:">{actors || '—'}</MetaRow>
                                    <MetaRow label="Thời lượng:">{durationLine}</MetaRow>
                                    <MetaRow label="Chất lượng:">{movie.quality || '—'}</MetaRow>
                                    <MetaRow label="Ngôn ngữ:">
                                        {movie.language?.trim() || 'Vietsub'}
                                    </MetaRow>
                                    <MetaRow label="Tập:">
                                        {movie.episode_current}
                                        {movie.episode_total ? ` / ${movie.episode_total}` : ''}
                                    </MetaRow>
                                    <MetaRow label="Lượt xem:">{viewLine}</MetaRow>
                                </div>
                            </div>
                        </div>

                        <section className="mt-10 border-t border-white/10 pt-8">
                            <h2 className="mb-4 text-base font-bold uppercase tracking-wide text-amber-300 md:text-lg">
                                Danh sách tập phim
                            </h2>
                            {episodesSorted.length === 0 ? (
                                <p className="text-sm text-zinc-500">Chưa có tập.</p>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {episodesSorted.map((ep) => {
                                        const label = ep.name?.trim() || String(ep.episode_number);
                                        const active = selectedEpisode?.id === ep.id;
                                        return (
                                            <button
                                                key={ep.id}
                                                type="button"
                                                onClick={() => void refreshEpisodeEmbed(ep)}
                                                className={[
                                                    'min-w-[3rem] rounded-lg border px-3 py-2 text-sm font-medium transition',
                                                    active
                                                        ? 'border-[#e50914] bg-[#e50914]/20 text-white'
                                                        : 'border-white/10 bg-zinc-900 text-zinc-300 hover:border-white/20 hover:bg-zinc-800',
                                                ].join(' ')}
                                            >
                                                {label}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            <div id="watch-player" className="mt-8 scroll-mt-28">
                                <div className="aspect-video w-full overflow-hidden rounded-lg border border-white/10 bg-black">
                                    {selectedEpisode?.embed_url ? (
                                        <iframe
                                            title="Xem phim"
                                            src={selectedEpisode.embed_url}
                                            className="h-full w-full"
                                            allowFullScreen
                                            referrerPolicy="no-referrer-when-downgrade"
                                        />
                                    ) : (
                                        <div className="flex h-full min-h-[200px] items-center justify-center text-zinc-500">
                                            {selectedEpisode
                                                ? 'Tập này chưa có link embed.'
                                                : 'Chọn tập để xem.'}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        <section className="mt-10 border-t border-white/10 pt-8">
                            <h2 className="mb-4 text-base font-bold uppercase tracking-wide text-amber-300 md:text-lg">
                                Nội dung phim
                            </h2>
                            <div className="max-w-none text-sm leading-relaxed text-zinc-300">
                                {descIsHtml ? (
                                    <div
                                        className="prose prose-invert prose-p:mb-3 max-w-none"
                                        dangerouslySetInnerHTML={{ __html: desc }}
                                    />
                                ) : (
                                    <p className="whitespace-pre-wrap">{desc || '—'}</p>
                                )}
                            </div>
                        </section>

                        {relatedMovies.length > 0 && (
                            <section className="mt-12 border-t border-white/10 pt-8">
                                <h2 className="mb-5 text-base font-bold uppercase tracking-wide text-amber-300 md:text-lg">
                                    Có thể bạn muốn xem
                                </h2>
                                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
                                    {relatedMovies.map((m) => (
                                        <li key={m.id}>
                                            <RelatedMovieCard movie={m} />
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        )}
                    </div>

                    <aside className="w-full shrink-0 space-y-6 lg:w-[280px] xl:w-[320px]">
                        <DetailSidebarBlock title="Sắp chiếu">
                            {sidebarSections.sapChieu.length === 0 ? (
                                <p className="px-3 py-4 text-center text-xs text-zinc-500">Chưa có phim.</p>
                            ) : (
                                sidebarSections.sapChieu.slice(0, 8).map((m) => (
                                    <DetailSidebarRow key={m.id} movie={m} />
                                ))
                            )}
                        </DetailSidebarBlock>

                        <DetailSidebarBlock title="Mới cập nhật">
                            {sidebarSections.moiCapNhat.length === 0 ? (
                                <p className="px-3 py-4 text-center text-xs text-zinc-500">—</p>
                            ) : (
                                sidebarSections.moiCapNhat.slice(0, 10).map((m) => (
                                    <DetailSidebarRow key={m.id} movie={m} />
                                ))
                            )}
                        </DetailSidebarBlock>
                    </aside>
                </div>
            </div>
        </div>
    );
}
