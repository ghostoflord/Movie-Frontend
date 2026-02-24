import Link from 'next/link';

export default function MarketingPage() {
    return (
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center">
                <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                    Test Laravel API với Next.js 14
                </h1>
                <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
                    Sử dụng App Router, Route Groups, và React Query
                </p>

                <div className="mt-8 flex justify-center gap-4">
                    <Link
                        href="/login"
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        Đăng nhập
                    </Link>
                    <Link
                        href="/register"
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                    >
                        Đăng ký
                    </Link>
                </div>
            </div>
        </div>
    );
}