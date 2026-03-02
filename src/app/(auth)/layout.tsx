'use client';

import Link from 'next/link';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative min-h-screen bg-black overflow-x-hidden selection:bg-red-600 selection:text-white">
            {/* Header / Logo Section */}
            <header className="absolute top-0 left-0 w-full z-20 p-4 md:px-12 md:py-8">
                <Link href="/" className="inline-block">
                    {/* Bạn có thể thay bằng thẻ <img> logo của bạn */}
                    <h1 className="text-3xl md:text-4xl font-black text-[#e50914] tracking-tighter uppercase">
                        NETFILM
                    </h1>
                </Link>
            </header>

            {/* Main Content Container */}
            <main className="relative z-10 flex min-h-screen items-center justify-center p-0 sm:p-4">
                {/* Responsive Wrapper: 
                   - Mobile: Rộng 100%, không bo góc 
                   - Tablet/PC: Tối đa 450px, có bo góc
                */}
                <div className="w-full sm:max-w-[450px]">
                    {children}
                </div>
            </main>

            {/* Footer đơn giản kiểu web phim */}
            <footer className="absolute bottom-0 w-full z-20 hidden md:block bg-black/80 border-t border-white/10 py-6 px-12">
                <div className="max-w-6xl mx-auto text-gray-500 text-sm">
                    <p className="mb-4">Câu hỏi? Liên hệ với chúng tôi.</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Link href="#" className="hover:underline">FAQ</Link>
                        <Link href="#" className="hover:underline">Trung tâm trợ giúp</Link>
                        <Link href="#" className="hover:underline">Điều khoản sử dụng</Link>
                        <Link href="#" className="hover:underline">Quyền riêng tư</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}