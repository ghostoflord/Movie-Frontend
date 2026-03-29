import { Suspense } from 'react';
import PhimBoView from '@/components/client/phim-bo-view';

export default function PhimBoPage() {
    return (
        <div className="min-h-screen bg-[#0b0b0f] text-white">
            <Suspense
                fallback={
                    <div className="flex min-h-[40vh] items-center justify-center">
                        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#e50914]" />
                    </div>
                }
            >
                <PhimBoView />
            </Suspense>
        </div>
    );
}
