'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BookCard } from '@/components/books/book-card';
import { BookGridSkeleton } from '@/components/books/book-card-skeleton';
import { bookService } from '@/services/book.service';
import type { Book } from '@/types';

export function NewBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBooks = async () => {
      try {
        setError(null);
        const data = await bookService.getNew(8);
        setBooks(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Không thể tải sách mới');
      } finally {
        setLoading(false);
      }
    };

    loadBooks();
  }, []);

  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Sách mới về</h2>
            <p className="mt-1 text-muted-foreground">Những cuốn sách vừa được cập nhật</p>
          </div>
          <Link href="/products?sort=newest">
            <Button variant="ghost" className="gap-2">
              Xem tất cả
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <BookGridSkeleton count={8} />
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : books.length === 0 ? (
          <p className="text-sm text-muted-foreground">Chưa có sách nào.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}