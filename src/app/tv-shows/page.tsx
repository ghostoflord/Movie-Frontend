import { Suspense } from 'react';
import { PhimCategoryClient } from '@/components/client/phim-category-client';

export default function TvShowsPage() {
    return (
        <div className="min-h-screen bg-[#0b0b0f] text-white">
            <Suspense
                fallback={
                    <div className="flex min-h-[40vh] items-center justify-center">
                        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#e50914]" />
                    </div>
                }
            >
                <PhimCategoryClient slug="tv-shows" />
            </Suspense>
        </div>
    );
}
