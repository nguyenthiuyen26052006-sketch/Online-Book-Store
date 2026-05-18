'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, ShoppingCart, ArrowLeft, Package, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { BookCard } from '@/components/books/book-card';
import { BookGridSkeleton } from '@/components/books/book-card-skeleton';
import { bookService } from '@/services/book.service';
import { categoryService } from '@/services/category.service';
import { cartService } from '@/services/cart.service';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { formatCurrency } from '@/utils/helpers';
import type { Book, Category } from '@/types';
import { toast } from 'sonner';
import { BookReviewsSection } from '@/components/books/book-reviews';

export default function ProductDetailPage() {
  const params = useParams();
  const bookUuid = params.uuid as string;

  const [book, setBook] = useState<Book | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [relatedBooks, setRelatedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [relatedLoading, setRelatedLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [sold, setSold] = useState(0);

  const addItem = useCartStore((state) => state.addItem);
  const setItems = useCartStore((state) => state.setItems);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const loadBook = async () => {
      setLoading(true);
      try {
        const data = await bookService.getByUuid(bookUuid);
        setBook(data);

        if (data) {
          const cat = await categoryService.getById(data.categoryId);
          setCategory(cat);

          setRelatedLoading(true);
          const related = await bookService.getRelated(data.id, data.categoryId, 4);
          setRelatedBooks(related);
          setRelatedLoading(false);

          const soldCount = await bookService.getSoldCount(data.id);
          setSold(soldCount);
        }
      } catch (error) {
        console.error('Failed to load book:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBook();
  }, [bookUuid]);

  const refreshBook = async () => {
    try {
      const data = await bookService.getByUuid(bookUuid);
      if (data) setBook(data);
    } catch {
      // Ignore refresh errors from review actions.
    }
  };

  const handleAddToCart = async () => {
    if (book) {
      try {
        if (isAuthenticated) {
          await cartService.addItem(book.id, quantity);
          const backendItems = await cartService.getMyCart();
          setItems(backendItems);
        } else {
          addItem(book, quantity);
        }
        toast.success('Đã thêm vào giỏ hàng', {
          description: `${book.title} × ${quantity}`,
        });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Không thể thêm vào giỏ');
      }
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="mb-8 h-5 w-28" />
        <div className="grid gap-10 lg:grid-cols-[380px_1fr]">
          <Skeleton className="aspect-3/4 w-full rounded-2xl" />
          <div className="space-y-5">
            <Skeleton className="h-9 w-3/4" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-px w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <div className="mb-5 text-7xl">📚</div>
        <h1 className="mb-3 text-2xl font-bold">Không tìm thấy sách</h1>
        <p className="mb-8 text-muted-foreground">
          Sách bạn tìm không tồn tại hoặc đã được gỡ khỏi cửa hàng.
        </p>
        <Link href="/products">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách
          </Button>
        </Link>
      </div>
    );
  }

  const isOutOfStock = book.stock === 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Main Product Section */}
      <div className="grid gap-10 lg:grid-cols-[380px_1fr]">

        {/* ── Left: Book Cover ── */}
        <div className="relative">
          <div className="sticky top-6">
            <div className="relative aspect-3/4 overflow-hidden rounded-2xl bg-muted shadow-md">
              <Image
                src={book.image}
                alt={book.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 380px"
              />
              {isOutOfStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
                  <span className="rounded-full bg-background px-4 py-1.5 text-sm font-semibold text-destructive shadow">
                    Hết hàng
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right: Product Info ── */}
        <div className="flex flex-col gap-5">

          {/* Category badge */}
          {category && (
            <div>
              <Link href={`/products?category=${category.slug}`}>
                <Badge variant="secondary" className="gap-1 text-xs font-medium">
                  <Tag className="h-3 w-3" />
                  {category.name}
                </Badge>
              </Link>
            </div>
          )}

          {/* Title & Author */}
          <div>
            <h1 className="mb-1.5 text-2xl font-bold leading-snug text-balance md:text-3xl">
              {book.title}
            </h1>
            <p className="text-base text-muted-foreground">
              Tác giả: <span className="font-medium text-foreground">{book.author}</span>
            </p>
          </div>

          {/* Price */}
          <div>
            <span className="text-3xl font-bold tracking-tight">
              {formatCurrency(book.price)}
            </span>
          </div>

          {/* Stock & Sold stats */}
          <div className="flex items-center gap-6 rounded-xl border bg-muted/40 px-4 py-3">
            <div className="flex items-center gap-2 text-sm">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Tồn kho:</span>
              <span
                className={`font-semibold ${
                  book.stock > 0 ? 'text-green-600 dark:text-green-400' : 'text-destructive'
                }`}
              >
                {book.stock > 0 ? `${book.stock} cuốn` : 'Hết hàng'}
              </span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2 text-sm">
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Đã bán:</span>
              <span className="font-semibold">{sold}</span>
            </div>
          </div>

          {/* Description */}
          <div className="rounded-xl border bg-muted/20 px-4 py-4">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Mô tả
            </h3>
            <p className="text-sm leading-relaxed text-foreground/80 text-pretty">
              {book.description}
            </p>
          </div>

          {/* Quantity + Add to Cart */}
          <div className="mt-auto space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">Số lượng:</span>
              <div className="flex items-center overflow-hidden rounded-lg border">
                <button
                  className="flex h-9 w-9 items-center justify-center transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  aria-label="Giảm số lượng"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-12 select-none border-x py-2 text-center text-sm font-semibold">
                  {quantity}
                </span>
                <button
                  className="flex h-9 w-9 items-center justify-center transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                  onClick={() => setQuantity(Math.min(book.stock, quantity + 1))}
                  disabled={quantity >= book.stock || isOutOfStock}
                  aria-label="Tăng số lượng"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full gap-2 text-base font-semibold"
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              <ShoppingCart className="h-5 w-5" />
              {isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
            </Button>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-16">
        <BookReviewsSection bookId={book.id} onReviewsChanged={refreshBook} />
      </div>

      {/* Related Books */}
      {relatedBooks.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-xl font-bold">Sách liên quan</h2>
          {relatedLoading ? (
            <BookGridSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {relatedBooks.map((relatedBook) => (
                <BookCard key={relatedBook.id} book={relatedBook} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}