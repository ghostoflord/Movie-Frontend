import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Tiếp tục xem | OPHIM',
    description: 'Xem tiếp các phim bạn đang xem dở',
};

export default function ContinueLayout({ children }: { children: React.ReactNode }) {
    return children;
}
