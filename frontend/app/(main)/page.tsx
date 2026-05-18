'use client';

import { HeroBanner } from '@/components/home/hero-banner';
import { CategorySection } from '@/components/home/category-section';
import { FeaturedBooks } from '@/components/home/featured-books';
import { NewBooks } from '@/components/home/new-books';

export default function HomePage() {
  return (
    <>
      <HeroBanner />
      <CategorySection />
      <FeaturedBooks />
      <NewBooks />
    </>
  );
}
