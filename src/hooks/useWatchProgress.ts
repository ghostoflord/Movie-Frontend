'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { watchHistoryAPI } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

const SAVE_INTERVAL_MS = 15_000;
const TICK_MS = 1_000;

type UseWatchProgressOptions = {
    episodeId: number | null;
    enabled: boolean;
    /** ?t= từ URL (click từ lịch sử / watch_url) */
    urlResumeSeconds?: number | null;
};

/**
 * Lưu tiến độ POST /watch-history (debounce ~15s).
 * Resume: ?t= trên URL hoặc GET /watch-history/episode/{id}.
 * Iframe embed không seek được — vẫn lưu current_time + hiện banner.
 */
export function useWatchProgress({ episodeId, enabled, urlResumeSeconds }: UseWatchProgressOptions) {
    const { isAuthenticated } = useAuth();
    const currentTimeRef = useRef(0);
    const lastSavedRef = useRef(0);
    const [resumeSeconds, setResumeSeconds] = useState<number | null>(null);

    const save = useCallback(
        async (force = false) => {
            if (!episodeId || !isAuthenticated) return;
            const current_time = Math.floor(currentTimeRef.current);
            if (!force && Math.abs(current_time - lastSavedRef.current) < 10) return;
            try {
                await watchHistoryAPI.saveProgress({
                    episode_id: episodeId,
                    current_time,
                });
                lastSavedRef.current = current_time;
            } catch {
                /* không chặn xem phim */
            }
        },
        [episodeId, isAuthenticated],
    );

    useEffect(() => {
        if (!enabled || !episodeId || !isAuthenticated) {
            setResumeSeconds(null);
            return;
        }

        let cancelled = false;
        let tickId: ReturnType<typeof setInterval> | undefined;
        let saveId: ReturnType<typeof setInterval> | undefined;

        const onFlush = () => void save(true);

        const urlStart =
            urlResumeSeconds != null && urlResumeSeconds > 0
                ? Math.floor(urlResumeSeconds)
                : 0;

        (async () => {
            let start = urlStart;

            try {
                const item = await watchHistoryAPI.getByEpisode(episodeId);
                if (!cancelled && item) {
                    const fromApi = Math.floor(item.resume_at ?? item.current_time ?? 0);
                    start = Math.max(start, fromApi);
                }
            } catch {
                /* 404 = chưa xem */
            }

            if (cancelled) return;

            currentTimeRef.current = start;
            lastSavedRef.current = start;
            setResumeSeconds(start > 5 ? start : null);

            tickId = setInterval(() => {
                if (document.visibilityState === 'visible') {
                    currentTimeRef.current += 1;
                }
            }, TICK_MS);

            saveId = setInterval(() => void save(), SAVE_INTERVAL_MS);
            document.addEventListener('visibilitychange', onFlush);
            window.addEventListener('beforeunload', onFlush);
        })();

        return () => {
            cancelled = true;
            if (tickId) clearInterval(tickId);
            if (saveId) clearInterval(saveId);
            document.removeEventListener('visibilitychange', onFlush);
            window.removeEventListener('beforeunload', onFlush);
            void save(true);
        };
    }, [episodeId, enabled, isAuthenticated, urlResumeSeconds, save]);

    const dismissResume = useCallback(() => setResumeSeconds(null), []);

    return { resumeSeconds, dismissResume, saveNow: () => void save(true) };
}
