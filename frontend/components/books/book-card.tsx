'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Star, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/store/cart-store';
import { formatCurrency } from '@/utils/helpers';
import type { Book } from '@/types';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { reviewService } from '@/services/review.service';
import { bookService } from '@/services/book.service';

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [rating, setRating] = useState(0);
  const [sold, setSold] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const reviews = await reviewService.getByBookId(book.id);
        if (reviews.length > 0) {
          const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
          setRating(avgRating);
        }
        const soldCount = await bookService.getSoldCount(book.id);
        setSold(soldCount);
      } catch {
        // Silently fail if stats can't be fetched
      }
    };
    fetchStats();
  }, [book.id]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(book, 1);
    toast.success('Đã thêm vào giỏ hàng', {
      description: book.title,
    });
  };

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <Link href={`/products/${book.uuid}`}>
        <div className="relative aspect-3/4 overflow-hidden bg-muted">
          <Image
            src={book.image}
            alt={book.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
          {book.stock === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <Badge variant="secondary">Hết hàng</Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="mb-1 line-clamp-2 min-h-10 text-sm font-medium transition-colors group-hover:text-primary">
            {book.title}
          </h3>
          <p className="mb-2 text-xs text-muted-foreground">{book.author}</p>
          <div className="mb-3 flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{rating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({sold} đã bán)</span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-base font-bold text-primary">{formatCurrency(book.price)}</p>
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8"
              onClick={handleAddToCart}
              disabled={book.stock === 0}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
