import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Hồ sơ của tôi | OPHIM',
    description: 'Thông tin tài khoản và gợi ý phim dành cho bạn',
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
    return children;
}
