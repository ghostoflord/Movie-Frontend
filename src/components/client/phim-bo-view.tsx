'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { parseMoviesListResponse, type PublicMovieListItem } from '@/lib/movies-public';
import { isPhimBo } from '@/lib/home-movie-sections';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
const FETCH_PER_PAGE = 120;
const PAGE_SIZE = 24;

function episodeTopRight(m: PublicMovieListItem): string {
    const t = (m.episode_current || '').trim();
    if (t) return t;
    if (m.episode_total) return String(m.episode_total);
    return m.status === 'trailer' ? 'Trailer' : '';
}

function sortMovies(list: PublicMovieListItem[], sort: string): PublicMovieListItem[] {
    const copy = [...list];
    if (sort === 'name') {
        copy.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    } else if (sort === 'year_asc') {
        copy.sort((a, b) => Number(a.year) - Number(b.year));
    } else if (sort === 'year_desc') {
        copy.sort((a, b) => Number(b.year) - Number(a.year));
    } else {
        copy.sort((a, b) => {
            const ta = new Date(a.updated_at || a.created_at || 0).getTime();
            const tb = new Date(b.updated_at || b.created_at || 0).getTime();
            return tb - ta;
        });
    }
    return copy;
}

function PhimBoCard({ movie }: { movie: PublicMovieListItem }) {
    const poster = movie.poster_url || movie.thumb_url;
    const q = (movie.quality || 'HD').trim();
    const ep = episodeTopRight(movie);
    const year = movie.year != null ? String(movie.year) : '';

    return (
        <Link
            href={`/phim/${movie.id}`}
            className="group flex flex-col overflow-hidden rounded-[4px] border border-white/5 bg-[#0d0d12] shadow-md transition hover:border-[#e50914]/35 hover:shadow-lg"
        >
            <div className="relative aspect-[2/3] w-full shrink-0 overflow-hidden bg-zinc-900">
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
                <div className="absolute left-2 top-2 z-10">
                    <span className="rounded bg-[#c40000] px-2 py-0.5 text-[10px] font-bold uppercase text-white shadow sm:text-[11px]">
                        {q}
                    </span>
                </div>
                {ep ? (
                    <div className="absolute right-2 top-2 z-10 max-w-[55%] text-right">
                        <span className="inline-block rounded bg-black/65 px-1.5 py-0.5 text-[10px] font-semibold text-white shadow sm:text-[11px]">
                            {ep}
                        </span>
                    </div>
                ) : null}
            </div>
            <div className="flex flex-1 flex-col border-t border-white/5 px-2 pb-2 pt-2">
                <h3 className="line-clamp-2 min-h-[2.5rem] text-[13px] font-bold leading-tight text-white">{movie.name}</h3>
                <p className="mt-1 line-clamp-1 text-[11px] text-zinc-500">
                    {[movie.origin_name, year].filter(Boolean).join(' · ')}
                </p>
                <span className="mt-auto flex w-full justify-center rounded-md bg-sky-600 py-1.5 text-center text-xs font-semibold text-white transition group-hover:bg-sky-500">
                    Xem phim
                </span>
            </div>
        </Link>
    );
}

function SidebarHotRow({ movie }: { movie: PublicMovieListItem }) {
    const thumb = movie.thumb_url || movie.poster_url;
    const year = movie.year != null ? String(movie.year) : '';

    return (
        <Link
            href={`/phim/${movie.id}`}
            className="flex gap-3 border-b border-white/5 px-2 py-2.5 last:border-0 hover:bg-white/[0.04]"
        >
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-zinc-900">
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
            <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-cyan-400">{movie.name}</p>
                <p className="mt-0.5 text-[11px] text-zinc-500">{year}</p>
                <div className="mt-1 flex gap-0.5 text-amber-500/80">
                    {'★★★★★'.split('').map((s, i) => (
                        <span key={i} className="text-[10px]">
                            {s}
                        </span>
                    ))}
                </div>
            </div>
        </Link>
    );
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="overflow-hidden rounded-lg border border-white/10 bg-[#0d0d12]">
            <div className="bg-[#c40000] px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-white sm:text-sm">
                {title}
            </div>
            <div>{children}</div>
        </div>
    );
}

function buildPhimBoQuery(base: Record<string, string | undefined>): string {
    const p = new URLSearchParams();
    const page = base.page || '1';
    p.set('page', page);
    if (base.genre) p.set('genre', base.genre);
    if (base.country) p.set('country', base.country);
    if (base.year) p.set('year', base.year);
    if (base.sort) p.set('sort', base.sort);
    return p.toString();
}

export default function PhimBoView() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const genreUrl = searchParams.get('genre') || '';
    const countryUrl = searchParams.get('country') || '';
    const yearUrl = searchParams.get('year') || '';
    const sortUrl = searchParams.get('sort') || 'updated';

    const [rawList, setRawList] = useState<PublicMovieListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [genre, setGenre] = useState(genreUrl);
    const [country, setCountry] = useState(countryUrl);
    const [year, setYear] = useState(yearUrl);
    const [sort, setSort] = useState(sortUrl);

    useEffect(() => {
        setGenre(genreUrl);
        setCountry(countryUrl);
        setYear(yearUrl);
        setSort(sortUrl);
    }, [genreUrl, countryUrl, yearUrl, sortUrl]);

    const fetchList = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            const headers: HeadersInit = { Accept: 'application/json' };
            if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;

            const params = new URLSearchParams();
            params.set('page', '1');
            params.set('per_page', String(FETCH_PER_PAGE));
            if (genreUrl) params.set('genre', genreUrl);
            if (countryUrl) params.set('country', countryUrl);
            if (yearUrl) params.set('year', yearUrl);

            const res = await fetch(`${API_URL}/movies?${params.toString()}`, { headers });
            const data = await res.json();
            if (!res.ok) {
                setError(typeof data?.message === 'string' ? data.message : `Lỗi ${res.status}`);
                setRawList([]);
                return;
            }
            const { list } = parseMoviesListResponse(data);
            setRawList(list);
        } catch (e) {
            console.error(e);
            setError('Không tải được danh sách phim.');
            setRawList([]);
        } finally {
            setLoading(false);
        }
    }, [genreUrl, countryUrl, yearUrl]);

    useEffect(() => {
        fetchList();
    }, [fetchList]);

    const phimBoBase = useMemo(() => rawList.filter(isPhimBo), [rawList]);

    const filterOptions = useMemo(() => {
        const genres = new Set<string>();
        const countries = new Set<string>();
        const years = new Set<string>();
        for (const m of phimBoBase) {
            for (const c of m.categories || []) {
                if (c && String(c).trim()) genres.add(String(c).trim());
            }
            if (m.country && String(m.country).trim()) countries.add(String(m.country).trim());
            if (m.year != null) years.add(String(m.year));
        }
        return {
            genres: [...genres].sort((a, b) => a.localeCompare(b, 'vi')),
            countries: [...countries].sort((a, b) => a.localeCompare(b, 'vi')),
            years: [...years].sort((a, b) => parseInt(b, 10) - parseInt(a, 10)),
        };
    }, [phimBoBase]);

    const filteredSorted = useMemo(() => {
        let list = phimBoBase;
        if (genreUrl) {
            list = list.filter((m) => (m.categories || []).some((c) => String(c) === genreUrl));
        }
        if (countryUrl) {
            list = list.filter((m) => (m.country || '').trim() === countryUrl);
        }
        if (yearUrl) {
            list = list.filter((m) => String(m.year) === yearUrl);
        }
        return sortMovies(list, sortUrl);
    }, [phimBoBase, genreUrl, countryUrl, yearUrl, sortUrl]);

    const lastPage = Math.max(1, Math.ceil(filteredSorted.length / PAGE_SIZE));
    const safePage = Math.min(page, lastPage);
    const pageItems = useMemo(() => {
        const start = (safePage - 1) * PAGE_SIZE;
        return filteredSorted.slice(start, start + PAGE_SIZE);
    }, [filteredSorted, safePage]);

    const pageNumbers = useMemo(() => {
        if (lastPage <= 1) return [];
        const max = 12;
        if (lastPage <= max) return Array.from({ length: lastPage }, (_, i) => i + 1);
        let start = Math.max(1, safePage - 5);
        const end = Math.min(lastPage, start + max - 1);
        if (end - start < max - 1) start = Math.max(1, end - max + 1);
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }, [lastPage, safePage]);
    const hotToday = useMemo(() => {
        const onlyBo = rawList.filter(isPhimBo);
        const withViews = [...onlyBo].sort((a, b) => (b.view_count ?? 0) - (a.view_count ?? 0));
        if (withViews.some((m) => (m.view_count ?? 0) > 0)) {
            return withViews.slice(0, 8);
        }
        return [...onlyBo]
            .sort(
                (a, b) =>
                    new Date(b.updated_at || b.created_at || 0).getTime() -
                    new Date(a.updated_at || a.created_at || 0).getTime(),
            )
            .slice(0, 8);
    }, [rawList]);

    const moiCapNhatBo = useMemo(() => {
        return [...phimBoBase].sort((a, b) => {
            const ta = new Date(a.updated_at || a.created_at || 0).getTime();
            const tb = new Date(b.updated_at || b.created_at || 0).getTime();
            return tb - ta;
        });
    }, [phimBoBase]);

    const applyFilters = () => {
        const q = buildPhimBoQuery({
            page: '1',
            genre: genre || undefined,
            country: country || undefined,
            year: year || undefined,
            sort: sort || 'updated',
        });
        router.push(`/phim-bo?${q}`);
    };

    const hrefPage = (p: number) =>
        `/phim-bo?${buildPhimBoQuery({
            page: String(p),
            genre: genreUrl || undefined,
            country: countryUrl || undefined,
            year: yearUrl || undefined,
            sort: sortUrl || undefined,
        })}`;

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

            <nav className="mb-6 text-sm text-zinc-500">
                <Link href="/" className="text-zinc-400 hover:text-amber-300">
                    Trang chủ
                </Link>
                <span className="mx-2 text-zinc-600">»</span>
                <span className="text-zinc-300">Phim bộ</span>
            </nav>

            <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-8">
                <div className="min-w-0 flex-1 lg:max-w-[78%]">
                    <h1 className="mb-6 text-xl font-bold uppercase tracking-wide text-white md:text-2xl">Phim bộ</h1>

                    <div className="mb-6 flex flex-col gap-3 rounded-lg border border-white/10 bg-[#0d0d12] p-4 sm:flex-row sm:flex-wrap sm:items-end">
                        <label className="flex min-w-[140px] flex-1 flex-col gap-1 text-xs text-zinc-400">
                            Thể loại
                            <select
                                value={genre}
                                onChange={(e) => setGenre(e.target.value)}
                                className="rounded-md border border-white/15 bg-black px-3 py-2 text-sm text-white"
                            >
                                <option value="">Tất cả</option>
                                {filterOptions.genres.map((g) => (
                                    <option key={g} value={g}>
                                        {g}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="flex min-w-[140px] flex-1 flex-col gap-1 text-xs text-zinc-400">
                            Quốc gia
                            <select
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                className="rounded-md border border-white/15 bg-black px-3 py-2 text-sm text-white"
                            >
                                <option value="">Tất cả</option>
                                {filterOptions.countries.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="flex min-w-[120px] flex-1 flex-col gap-1 text-xs text-zinc-400">
                            Năm
                            <select
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                className="rounded-md border border-white/15 bg-black px-3 py-2 text-sm text-white"
                            >
                                <option value="">Tất cả</option>
                                {filterOptions.years.map((y) => (
                                    <option key={y} value={y}>
                                        {y}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="flex min-w-[160px] flex-1 flex-col gap-1 text-xs text-zinc-400">
                            Sắp xếp
                            <select
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                                className="rounded-md border border-white/15 bg-black px-3 py-2 text-sm text-white"
                            >
                                <option value="updated">Mới cập nhật</option>
                                <option value="year_desc">Năm (mới → cũ)</option>
                                <option value="year_asc">Năm (cũ → mới)</option>
                                <option value="name">Tên A–Z</option>
                            </select>
                        </label>
                        <button
                            type="button"
                            onClick={applyFilters}
                            className="rounded-md bg-[#e50914] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#ff0f1a] sm:shrink-0"
                        >
                            Lọc phim
                        </button>
                    </div>

                    {filteredSorted.length === 0 ? (
                        <p className="py-12 text-center text-zinc-500">
                            Không có phim bộ phù hợp (hoặc API chưa trả đủ dữ liệu thể loại / quốc gia).
                        </p>
                    ) : (
                        <>
                            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
                                {pageItems.map((m) => (
                                    <li key={m.id}>
                                        <PhimBoCard movie={m} />
                                    </li>
                                ))}
                            </ul>

                            {lastPage > 1 && (
                                <nav
                                    className="mt-10 flex flex-wrap items-center justify-center gap-2"
                                    aria-label="Phân trang"
                                >
                                    {pageNumbers.map((p) => (
                                        <Link
                                            key={p}
                                            href={hrefPage(p)}
                                            className={[
                                                'flex min-w-[2.5rem] items-center justify-center rounded border px-3 py-2 text-sm transition',
                                                p === safePage
                                                    ? 'border-[#e50914] bg-[#e50914] font-semibold text-white'
                                                    : 'border-zinc-600 bg-zinc-900 text-zinc-300 hover:border-[#e50914]/50',
                                            ].join(' ')}
                                        >
                                            {p}
                                        </Link>
                                    ))}
                                </nav>
                            )}
                        </>
                    )}
                </div>

                <aside className="w-full shrink-0 space-y-6 lg:w-[300px] xl:w-[320px]">
                    <SidebarSection title="Hot trong ngày">
                        {hotToday.length === 0 ? (
                            <p className="px-3 py-4 text-center text-xs text-zinc-500">—</p>
                        ) : (
                            hotToday.map((m) => <SidebarHotRow key={m.id} movie={m} />)
                        )}
                    </SidebarSection>

                    <SidebarSection title="Mới cập nhật">
                        {moiCapNhatBo.length === 0 ? (
                            <p className="px-3 py-4 text-center text-xs text-zinc-500">—</p>
                        ) : (
                            moiCapNhatBo.slice(0, 12).map((m) => <SidebarHotRow key={m.id} movie={m} />)
                        )}
                    </SidebarSection>
                </aside>
            </div>
        </div>
    );
}
