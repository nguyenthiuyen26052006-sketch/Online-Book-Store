'use client';

import { useEffect, useRef } from 'react';
import { PageHero } from '@/components/layout/page-hero';

function useFade() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.dataset.visible = '1'; obs.unobserve(el); } },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function Fade({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useFade();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className="translate-y-4 opacity-0 transition-all duration-700 ease-out data-[visible=1]:translate-y-0 data-[visible=1]:opacity-100"
    >
      {children}
    </div>
  );
}

const STATS = [
  { value: '10.000+', label: 'Đầu sách' },
  { value: '50.000+', label: 'Độc giả' },
  { value: '63',      label: 'Tỉnh thành' },
  { value: '5★',      label: 'Đánh giá TB' },
];

const VALUES = [
  { num: '01', title: 'Chính hãng & minh bạch', desc: 'Sách chính hãng, giá niêm yết rõ ràng — không phụ phí ẩn.' },
  { num: '02', title: 'Giao hàng toàn quốc',    desc: 'Xử lý đơn trong ngày, vận chuyển đến 63 tỉnh thành.' },
  { num: '03', title: 'Tư vấn tận tâm',          desc: 'Đội ngũ sẵn sàng giúp bạn tìm đúng cuốn sách cần.' },
  { num: '04', title: 'Cộng đồng đọc sách',      desc: 'Đánh giá thật từ độc giả, xây dựng văn hóa đọc lành mạnh.' },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        title="Về chúng tôi"
        subtitle="Nền tảng sách trực tuyến dành cho mọi độc giả."
      />

      <div className="mx-auto max-w-3xl space-y-20 px-4 py-16 sm:px-6 lg:px-8">

        {/* Mission */}
        <Fade>
          <div className="grid gap-8 sm:grid-cols-[1fr_2fr]">
            <p className="pt-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Sứ mệnh
            </p>
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold leading-snug tracking-tight">
                Giúp mỗi người tìm được<br />quyển sách dành cho mình.
              </h2>
              <p className="leading-relaxed text-muted-foreground">
                BookStore mang đến trải nghiệm mua sách trực tuyến tiện lợi, minh bạch
                và thân thiện. Chúng tôi tuyển chọn sách từ văn học, kinh doanh, công nghệ
                đến phát triển bản thân — để mọi người dễ dàng nuôi dưỡng thói quen đọc mỗi ngày.
              </p>
            </div>
          </div>
        </Fade>

        {/* Stats */}
        <Fade delay={80}>
          <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-border sm:grid-cols-4">
            {STATS.map(({ value, label }) => (
              <div key={label} className="bg-card px-6 py-6 text-center [&:not(:last-child)]:border-r [&:not(:last-child)]:border-border">
                <p className="text-2xl font-semibold tabular-nums">{value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </Fade>

        {/* Values */}
        <Fade delay={100}>
          <div className="grid gap-8 sm:grid-cols-[1fr_2fr]">
            <p className="pt-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Giá trị cốt lõi
            </p>
            <div className="divide-y divide-border">
              {VALUES.map(({ num, title, desc }) => (
                <div key={num} className="flex gap-5 py-5 first:pt-0 last:pb-0">
                  <span className="shrink-0 pt-0.5 text-xs font-medium tabular-nums text-muted-foreground/40">
                    {num}
                  </span>
                  <div>
                    <p className="mb-1 font-medium">{title}</p>
                    <p className="text-sm leading-relaxed text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Fade>

        {/* Promise */}
        <Fade delay={80}>
          <div className="grid gap-8 sm:grid-cols-[1fr_2fr]">
            <p className="pt-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Cam kết
            </p>
            <p className="border-l-2 border-border pl-5 leading-relaxed text-muted-foreground">
              Mỗi đơn hàng đều được xử lý cẩn thận. Đội ngũ của chúng tôi luôn lắng
              nghe phản hồi để cải thiện dịch vụ ngày càng tốt hơn — vì một cộng đồng
              đọc sách ngày càng lớn mạnh.
            </p>
          </div>
        </Fade>

      </div>
    </>
  );
}