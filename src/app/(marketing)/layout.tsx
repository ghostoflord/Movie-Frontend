import Link from 'next/link';

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Marketing Header */}
            <header className="bg-white shadow-sm">
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center">
                            <Link href="/" className="text-2xl font-bold text-indigo-600">
                                TestApp
                            </Link>
                            <div className="hidden md:flex ml-10 space-x-8">
                                <Link href="/" className="text-gray-700 hover:text-indigo-600">
                                    Home
                                </Link>
                                <Link href="/about" className="text-gray-700 hover:text-indigo-600">
                                    About
                                </Link>
                                <Link href="/contact" className="text-gray-700 hover:text-indigo-600">
                                    Contact
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/login"
                                className="text-gray-700 hover:text-indigo-600 px-3 py-2"
                            >
                                Đăng nhập
                            </Link>
                            <Link
                                href="/register"
                                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                            >
                                Đăng ký
                            </Link>
                        </div>
                    </div>
                </nav>
            </header>

            {/* Main Content */}
            <main>{children}</main>

            {/* Marketing Footer */}
            <footer className="bg-white border-t mt-12">
                <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-gray-500">
                        © 2024 TestApp. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}