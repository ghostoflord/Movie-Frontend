import Link from 'next/link';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <Link href="/" className="flex justify-center">
                    <span className="text-3xl font-bold text-indigo-600">TestApp</span>
                </Link>
            </div>

            {children}

            <div className="mt-8 text-center">
                <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
                    ← Quay lại trang chủ
                </Link>
            </div>
        </div>
    );
}