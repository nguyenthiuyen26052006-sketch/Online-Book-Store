'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const slides = [
  {
    id: 1,
    title: 'Khám phá thế giới sách',
    description: 'Hàng ngàn đầu sách đang chờ bạn. Ưu đãi hấp dẫn cho đơn hàng đầu tiên.',
    image: 'https://kajabi-storefronts-production.kajabi-cdn.com/kajabi-storefronts-production/blogs/20044/images/VoNLCopMRhSPSTxOO4hQ_caleb-woods-fulXJYIvRi8-unsplash.jpg',
    cta: 'Mua ngay',
    href: '/products',
    gradient: 'from-sky-400/25 to-blue-500/25',
  },
  {
    id: 2,
    title: 'Sách công nghệ mới nhất',
    description: 'Cập nhật những cuốn sách công nghệ nổi bật và hiện đại.',
    image: 'https://www.franchisewire.com/wp-content/uploads/2020/10/Technology-and-franchise.jpg',
    cta: 'Khám phá',
    href: '/products?category=technology',
    gradient: 'from-blue-400/30 to-cyan-500/30',
  },
  {
    id: 3,
    title: 'Phát triển bản thân',
    description: 'Những cuốn sách giúp bạn nâng cấp bản thân mỗi ngày.',
    image: 'https://cms.buzzrx.com/globalassets/buzzrx/blogs/self-care-activities.webp',
    cta: 'Tìm hiểu',
    href: '/products?category=business',
    gradient: 'from-emerald-400/30 to-teal-500/30',
  },
];

export function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section className="relative overflow-hidden">
      <div className="relative h-100 md:h-125">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={cn(
              'absolute inset-0 transition-opacity duration-500',
              index === currentSlide ? 'opacity-100' : 'pointer-events-none opacity-0',
            )}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.image})` }}
            />
            <div className={cn('absolute inset-0 bg-linear-to-r', slide.gradient)} />
            <div className="relative flex h-full items-center">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="max-w-xl">
                  <h1 className="mb-4 text-balance text-3xl font-bold text-white md:text-5xl">
                    {slide.title}
                  </h1>
                  <p className="mb-6 text-pretty text-lg text-white/90">{slide.description}</p>
                  <Link href={slide.href}>
                    <Button size="lg" variant="secondary" className="font-semibold">
                      {slide.cta}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={cn(
              'h-2 rounded-full transition-all',
              index === currentSlide ? 'w-6 bg-white' : 'w-2 bg-white/50',
            )}
          />
        ))}
      </div>
    </section>
  );
}