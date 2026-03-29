import Link from 'next/link';

export default function SiteFooter() {
    return (
        <footer className="border-t border-white/5 bg-[#0f0f0f] text-zinc-300">
            <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 sm:py-14">
                <h2 className="mb-4 text-lg font-bold text-white">Giới Thiệu...</h2>

                <p className="mb-3 max-w-4xl text-sm leading-relaxed sm:text-[15px]">
                    <strong className="font-semibold text-white">Xem phim online</strong>{' '}
                    <span className="text-zinc-400">
                        chất lượng cao miễn phí với phụ đề tiếng việt - thuyết minh - lồng tiếng, có nhiều
                        thể loại phim phong phú, đặc sắc, nhiều bộ phim hay nhất - mới nhất.
                    </span>
                </p>

                <p className="mb-8 max-w-4xl text-sm leading-relaxed text-zinc-400 sm:text-[15px]">
                    Website với giao diện trực quan, thuận tiện, tốc độ tải nhanh, ít quảng cáo hứa hẹn sẽ đem
                    lại những trải nghiệm tốt cho người dùng.
                </p>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    <Link href="/lien-he" className="text-[#00bcd4] transition hover:underline">
                        Liên Hệ
                    </Link>
                    <Link href="/khieu-nai-ban-quyen" className="text-[#00bcd4] transition hover:underline">
                        Khiếu nại bản quyền
                    </Link>
                </div>
            </div>
        </footer>
    );
}
