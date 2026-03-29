'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { PublicMovieDetail, PublicMovieEpisode } from '@/types/public-movie-detail';

function PlayIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M8 5v14l11-7z" />
        </svg>
    );
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

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

export default function MovieDetailView({ movieId }: { movieId: string }) {
    const [movie, setMovie] = useState<PublicMovieDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedEpisode, setSelectedEpisode] = useState<PublicMovieEpisode | null>(null);
    const [contentOpen, setContentOpen] = useState(true);

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
                setError(typeof json?.message === 'string' ? json.message : `Lỗi ${res.status}`);
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
            setError('Không tải được phim.');
            setMovie(null);
        } finally {
            setLoading(false);
        }
    }, [movieId]);

    useEffect(() => {
        fetchMovie();
    }, [fetchMovie]);

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

    return (
        <div className="min-h-screen bg-black text-zinc-100">
            {/* Hero */}
            <div className="relative h-[42vh] min-h-[260px] w-full overflow-hidden md:h-[48vh]">
                {poster ? (
                    <>
                        <img
                            src={poster}
                            alt=""
                            className="absolute inset-0 h-full w-full scale-105 object-cover blur-md opacity-50"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/75 to-black" />
                    </>
                ) : (
                    <div className="absolute inset-0 bg-zinc-900" />
                )}
                <button
                    type="button"
                    onClick={playFirst}
                    className="absolute left-1/2 top-1/2 z-10 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#e50914] text-white shadow-[0_8px_40px_rgba(229,9,20,0.5)] transition hover:scale-105 hover:bg-[#ff0f1a] md:h-20 md:w-20"
                    aria-label="Xem phim"
                >
                    <PlayIcon className="ml-1 h-8 w-8 md:h-10 md:w-10" />
                </button>
            </div>

            <div className="relative z-10 mx-auto max-w-6xl px-4 pb-16 md:-mt-28">
                <div className="flex flex-col gap-8 md:flex-row md:gap-10">
                    <div className="mx-auto w-48 shrink-0 overflow-hidden rounded-lg border border-white/10 shadow-2xl md:mx-0 md:w-56 lg:w-64">
                        {poster ? (
                            <img src={poster} alt={movie.name} className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex aspect-[2/3] items-center justify-center bg-zinc-900 text-zinc-600">No poster</div>
                        )}
                    </div>

                    <div className="min-w-0 flex-1 pt-2 md:pt-24">
                        <nav className="mb-3 flex flex-wrap items-center gap-1.5 text-xs text-zinc-500 md:text-sm">
                            <Link href="/" className="hover:text-[#e50914]">
                                Trang chủ
                            </Link>
                            <span>/</span>
                            <Link href="/" className="hover:text-[#e50914]">
                                Phim bộ
                            </Link>
                            <span>/</span>
                            <span className="text-zinc-400">{movie.name}</span>
                        </nav>

                        <h1 className="text-2xl font-bold leading-tight text-white md:text-3xl lg:text-4xl">{movie.name}</h1>
                        <p className="mt-2 text-base text-zinc-400 md:text-lg">{movie.origin_name}</p>

                        <div className="mt-5 flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={playFirst}
                                className="inline-flex items-center gap-2 rounded-lg bg-[#e50914] px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-900/30 transition hover:bg-[#ff0f1a]"
                            >
                                <PlayIcon className="h-4 w-4" />
                                Xem phim
                            </button>
                        </div>

                        {movie.episode_current && (
                            <div className="mt-4 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#e50914]">
                                Mới nhất: {movie.episode_current}
                                {movie.episode_total ? ` · ${movie.episode_total}` : ''}
                            </div>
                        )}

                        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-400">
                            <span>
                                <span className="text-zinc-600">Năm:</span> {movie.year}
                            </span>
                            <span>
                                <span className="text-zinc-600">Tập:</span> {movie.episode_current}
                                {movie.episode_total ? ` / ${movie.episode_total}` : ''}
                            </span>
                            {movie.quality && (
                                <span className="rounded bg-[#e50914]/90 px-2 py-0.5 text-xs font-semibold text-white">{movie.quality}</span>
                            )}
                            {movie.language && (
                                <span>
                                    <span className="text-zinc-600">Ngôn ngữ:</span> {movie.language}
                                </span>
                            )}
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-1 text-amber-400">
                                {'★★★★★'.split('').map((s, i) => (
                                    <span key={i} className={i < 4 ? 'opacity-100' : 'opacity-40'}>
                                        {s}
                                    </span>
                                ))}
                                <span className="ml-2 text-sm text-zinc-500">(đánh giá)</span>
                            </div>
                            <div className="flex gap-2">
                                <a
                                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs hover:bg-zinc-700"
                                >
                                    f
                                </a>
                                <a
                                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs hover:bg-zinc-700"
                                >
                                    𝕏
                                </a>
                            </div>
                        </div>

                        {categories.length > 0 && (
                            <div className="mt-5">
                                <span className="text-sm text-zinc-500">Thể loại: </span>
                                <span className="flex flex-wrap gap-2 mt-1">
                                    {categories.map((c) => (
                                        <span key={c} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-zinc-300">
                                            {c}
                                        </span>
                                    ))}
                                </span>
                            </div>
                        )}

                        {(actors || directors) && (
                            <div className="mt-4 space-y-1 text-sm">
                                {actors && (
                                    <p>
                                        <span className="text-zinc-500">Diễn viên: </span>
                                        <span className="text-zinc-300">{actors}</span>
                                    </p>
                                )}
                                {directors && (
                                    <p>
                                        <span className="text-zinc-500">Đạo diễn: </span>
                                        <span className="text-zinc-300">{directors}</span>
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Tập & player */}
                <section className="mt-12 border-t border-white/10 pt-10">
                    <h2 className="mb-4 text-lg font-semibold text-white">Danh sách tập phim</h2>
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

                    <button
                        type="button"
                        onClick={() => setContentOpen((v) => !v)}
                        className="mt-6 w-full rounded-lg border border-white/10 bg-zinc-900/80 py-2.5 text-sm text-zinc-300 transition hover:bg-zinc-800 md:w-auto md:px-8"
                    >
                        Nội dung phim
                    </button>

                    <div id="watch-player" className="mt-8 scroll-mt-24">
                        <div className="aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black">
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
                        {selectedEpisode && (
                            <p className="mt-2 text-center text-xs text-zinc-500">
                                Đang phát: Tập {selectedEpisode.episode_number}
                                {selectedEpisode.name ? ` — ${selectedEpisode.name}` : ''}
                            </p>
                        )}
                    </div>
                </section>

                {contentOpen && (
                    <section className="mt-10 border-t border-white/10 pt-10">
                        <h3 className="text-lg font-semibold text-white">
                            Nội dung phim: {movie.name}
                            {movie.origin_name && (
                                <span className="font-normal text-zinc-400"> ({movie.origin_name})</span>
                            )}
                        </h3>
                        <div className="prose prose-invert mt-4 max-w-none text-sm leading-relaxed text-zinc-300 prose-p:mb-3">
                            {descIsHtml ? (
                                <div dangerouslySetInnerHTML={{ __html: desc }} />
                            ) : (
                                <p className="whitespace-pre-wrap">{desc}</p>
                            )}
                        </div>
                        <div className="mt-6 flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-white">Tags:</span>
                            <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs text-zinc-400">{movie.name}</span>
                            {movie.origin_name && (
                                <span className="rounded-full bg-zinc-900 px-3 py-1 text-xs text-zinc-400">{movie.origin_name}</span>
                            )}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
