'use client';

import Link from 'next/link';
import { Play, Trash2 } from 'lucide-react';
import type { WatchHistoryItem } from '@/types/watch-history';
import { formatWatchTime } from '@/lib/format-watch-time';
import { getResumeSeconds, watchHistoryResumeHref } from '@/lib/watch-resume-url';

function episodeLabel(item: WatchHistoryItem): string {
    if (item.episode_label?.trim()) return item.episode_label.trim();
    const ep = item.episode;
    if (!ep) return '';
    if (ep.name?.trim()) return `Tập ${ep.name.trim()}`;
    if (ep.episode_number != null) return `Tập ${ep.episode_number}`;
    return 'Tập ?';
}

type WatchHistoryCardProps = {
    item: WatchHistoryItem;
    onDelete?: (item: WatchHistoryItem) => void;
    compact?: boolean;
};

export function WatchHistoryCard({ item, onDelete, compact }: WatchHistoryCardProps) {
    const movie = item.movie;
    const poster = movie?.poster_url || movie?.thumb_url;
    const progress = Math.min(100, Math.max(0, item.progress_percent ?? 0));
    const href = watchHistoryResumeHref(item);
    const resumeSec = getResumeSeconds(item);

    return (
        <article
            className={[
                'group relative overflow-hidden rounded-lg border border-white/10 bg-[#0d0d12] transition hover:border-[#e50914]/40',
                compact ? 'w-[140px] shrink-0 sm:w-[160px]' : '',
            ].join(' ')}
        >
            <Link href={href} className="block">
                <div className={`relative overflow-hidden bg-zinc-900 ${compact ? 'aspect-[2/3]' : 'aspect-video'}`}>
                    {poster ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={poster}
                            alt={movie?.name ?? ''}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                            loading="lazy"
                            referrerPolicy="no-referrer"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-xs text-zinc-600">No image</div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e50914] text-white shadow-lg">
                            <Play className="ml-0.5 h-5 w-5 fill-current" aria-hidden />
                        </span>
                    </div>
                    {progress > 0 ? (
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-zinc-800">
                            <div
                                className="h-full bg-[#e50914]"
                                style={{ width: `${progress}%` }}
                                aria-hidden
                            />
                        </div>
                    ) : null}
                </div>
                <div className={compact ? 'p-2' : 'p-3'}>
                    <h3
                        className={`line-clamp-2 font-semibold text-[#f5de7a] ${compact ? 'text-[11px] leading-snug' : 'text-sm'}`}
                    >
                        {movie?.name ?? 'Phim'}
                    </h3>
                    <p className={`mt-0.5 text-zinc-500 ${compact ? 'text-[10px]' : 'text-xs'}`}>
                        {episodeLabel(item)}
                        {resumeSec > 0 ? ` · ${formatWatchTime(resumeSec)}` : ''}
                        {progress > 0 ? ` · ${progress.toFixed(0)}%` : ''}
                    </p>
                </div>
            </Link>
            {onDelete ? (
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault();
                        onDelete(item);
                    }}
                    className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-zinc-300 opacity-0 transition hover:bg-red-600/90 hover:text-white group-hover:opacity-100"
                    aria-label="Xóa khỏi lịch sử"
                >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                </button>
            ) : null}
        </article>
    );
}
