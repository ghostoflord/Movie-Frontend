'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { watchHistoryAPI } from '@/lib/api';
import { toUserErrorMessage } from '@/lib/api-error';
import type { WatchHistoryItem } from '@/types/watch-history';
import { WatchHistoryCard } from '@/components/client/watch-history-card';

export function ContinueWatchingSection({ limit = 10 }: { limit?: number }) {
    const { token, isAuthenticated } = useAuth();
    const [items, setItems] = useState<WatchHistoryItem[]>([]);
    const [loading, setLoading] = useState(false);

    const load = useCallback(async () => {
        if (!token) {
            setItems([]);
            return;
        }
        setLoading(true);
        try {
            const list = await watchHistoryAPI.listContinue({ per_page: limit });
            setItems(list);
        } catch {
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [token, limit]);

    useEffect(() => {
        if (isAuthenticated && token) {
            void load();
        } else {
            setItems([]);
        }
    }, [isAuthenticated, token, load]);

    if (!isAuthenticated || (!loading && items.length === 0)) {
        return null;
    }

    return (
        <section className="mb-10">
            <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold uppercase tracking-wide text-amber-300 md:text-xl">
                    Tiếp tục xem
                </h2>
                <Link
                    href="/continue"
                    className="flex items-center gap-1 text-sm font-medium text-zinc-400 transition hover:text-[#e50914]"
                >
                    Xem tất cả
                    <ChevronRight className="h-4 w-4" aria-hidden />
                </Link>
            </div>
            {loading ? (
                <div className="flex gap-3 overflow-hidden">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-[220px] w-[140px] shrink-0 animate-pulse rounded-lg bg-zinc-800/80 sm:w-[160px]"
                        />
                    ))}
                </div>
            ) : (
                <div className="-mx-1 flex gap-3 overflow-x-auto pb-2 px-1 scrollbar-thin">
                    {items.map((item) => (
                        <WatchHistoryCard key={item.id} item={item} compact />
                    ))}
                </div>
            )}
        </section>
    );
}
