import Link from 'next/link';
import type { RecommendationMovie } from '@/types/admin-entities';

type MoviePosterGridProps = {
    movies: RecommendationMovie[];
};

export function MoviePosterGrid({ movies }: MoviePosterGridProps) {
    return (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {movies.map((m) => {
                const poster = m.poster_url || m.thumb_url;
                const sub = [m.origin_name, m.year != null ? String(m.year) : null].filter(Boolean).join(' · ');
                return (
                    <li key={m.id}>
                        <Link
                            href={`/phim/${m.id}`}
                            className="group block overflow-hidden rounded-[4px] border border-white/5 bg-[#0d0d12] shadow-md transition hover:border-[#e50914]/35 hover:shadow-lg hover:shadow-black/40"
                        >
                            <div className="relative aspect-[2/3] w-full overflow-hidden bg-zinc-900">
                                {poster ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={poster}
                                        alt={m.name}
                                        className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                        loading="lazy"
                                        decoding="async"
                                        referrerPolicy="no-referrer"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-[10px] text-white/35">
                                        Không ảnh
                                    </div>
                                )}
                                <div className="absolute inset-x-0 bottom-0 z-[5] bg-gradient-to-t from-black via-black/85 to-transparent px-2 pb-2.5 pt-16">
                                    <h3 className="truncate text-[13px] font-bold leading-snug text-[#f5de7a] drop-shadow-md sm:text-sm">
                                        {m.name}
                                    </h3>
                                    {sub ? (
                                        <p className="mt-0.5 truncate text-[10px] leading-tight text-white/80 drop-shadow sm:text-[11px]">
                                            {sub}
                                        </p>
                                    ) : null}
                                </div>
                            </div>
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
}
