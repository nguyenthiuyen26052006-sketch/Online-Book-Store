'use client';

import { Suspense, useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, X, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { BookCard } from '@/components/books/book-card';
import { BookGridSkeleton } from '@/components/books/book-card-skeleton';
import { bookService } from '@/services/book.service';
import { categoryService } from '@/services/category.service';
import type { Book, Category, SortOption, BookFilters } from '@/types';

const sortOptions = [
  { value: 'newest',     label: 'Mới nhất' },
  { value: 'bestseller', label: 'Bán chạy nhất' },
  { value: 'price-asc',  label: 'Giá: Thấp → Cao' },
  { value: 'price-desc', label: 'Giá: Cao → Thấp' },
  { value: 'rating',     label: 'Đánh giá cao nhất' },
];

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const search   = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sort     = (searchParams.get('sort') as SortOption) || 'newest';
  const page     = parseInt(searchParams.get('page') || '1', 10);

  const loadBooks = useCallback(async () => {
    setLoading(true);
    try {
      const filters: BookFilters = {};
      if (search) filters.search = search;
      if (category) {
        const cat = categories.find((c) => c.slug === category);
        if (cat) filters.categoryId = cat.id;
      }
      const response = await bookService.getAll(page, 12, filters, sort);
      setBooks(response.data);
      setTotalPages(response.totalPages);
      setTotalItems(response.total ?? response.data.length);
    } catch (error) {
      console.error('Không thể tải danh sách sách:', error);
    } finally {
      setLoading(false);
    }
  }, [search, category, sort, page, categories]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoryService.getAll();
        setCategories(data);
      } catch (error) {
        console.error('Không thể tải danh mục:', error);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    if (categories.length > 0 || !category) loadBooks();
  }, [loadBooks, categories.length, category]);

  const updateParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') params.delete(key);
      else params.set(key, value);
    });
    if (
      updates.search !== undefined ||
      updates.category !== undefined ||
      updates.sort !== undefined
    ) {
      params.delete('page');
    }
    router.push(`/products?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const searchValue = new FormData(e.currentTarget).get('search') as string;
    updateParams({ search: searchValue });
  };

  const clearFilters = () => router.push('/products');

  const hasFilters = !!(search || category);
  const activeCategory = categories.find((c) => c.slug === category);

  // Pagination window
  const getPaginationItems = () => {
    const delta = 2;
    const range: (number | '...')[] = [];
    for (let i = Math.max(2, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
      range.push(i);
    }
    if (page - delta > 2) range.unshift('...');
    if (page + delta < totalPages - 1) range.push('...');
    if (totalPages > 1) range.unshift(1);
    if (totalPages > 1) range.push(totalPages);
    return range;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

      {/* ── Page Header ── */}
      <div className="mb-8">
        <div className="flex items-center gap-2.5">
          <BookOpen className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Kho sách</h1>
        </div>
        <p className="mt-1.5 text-muted-foreground">
          Hàng ngàn đầu sách hay đang chờ bạn khám phá
        </p>
      </div>

      {/* ── Filter Bar ── */}
      <div className="mb-6 flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">

        {/* Search */}
        <form onSubmit={handleSearch} className="flex flex-1 gap-2 sm:max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="search"
              placeholder="Tên sách, tác giả..."
              defaultValue={search}
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="default">Tìm</Button>
        </form>

        <div className="flex items-center gap-2">
          {/* Mobile filter sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="relative gap-2 sm:hidden">
                <SlidersHorizontal className="h-4 w-4" />
                Bộ lọc
                {hasFilters && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {(search ? 1 : 0) + (category ? 1 : 0)}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <SheetHeader>
                <SheetTitle>Bộ lọc</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium">Danh mục</label>
                  <Select
                    value={category || 'all'}
                    onValueChange={(v) => updateParams({ category: v === 'all' ? null : v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tất cả danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả danh mục</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Sắp xếp</label>
                  <Select value={sort} onValueChange={(v) => updateParams({ sort: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {hasFilters && (
                  <Button variant="ghost" size="sm" className="w-full gap-1.5" onClick={clearFilters}>
                    <X className="h-3.5 w-3.5" />
                    Xoá bộ lọc
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Desktop selects */}
          <div className="hidden items-center gap-2 sm:flex">
            <Select
              value={category || 'all'}
              onValueChange={(v) => updateParams({ category: v === 'all' ? null : v })}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Tất cả danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sort} onValueChange={(v) => updateParams({ sort: v })}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ── Active filter tags ── */}
      {hasFilters && (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Đang lọc:</span>
          {search && (
            <Badge variant="secondary" className="gap-1.5 pr-1.5">
              Từ khoá: "{search}"
              <button
                onClick={() => updateParams({ search: null })}
                className="rounded-full p-0.5 hover:bg-muted-foreground/20"
                aria-label="Xoá tìm kiếm"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {activeCategory && (
            <Badge variant="secondary" className="gap-1.5 pr-1.5">
              {activeCategory.name}
              <button
                onClick={() => updateParams({ category: null })}
                className="rounded-full p-0.5 hover:bg-muted-foreground/20"
                aria-label="Xoá danh mục"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          <button
            onClick={clearFilters}
            className="text-xs text-muted-foreground underline-offset-2 hover:underline"
          >
            Xoá tất cả
          </button>
        </div>
      )}

      {/* ── Result count ── */}
      {!loading && books.length > 0 && (
        <p className="mb-4 text-sm text-muted-foreground">
          Hiển thị <span className="font-medium text-foreground">{books.length}</span> sách
          {totalItems > books.length && (
            <> trong tổng số <span className="font-medium text-foreground">{totalItems}</span> kết quả</>
          )}
        </p>
      )}

      {/* ── Book Grid ── */}
      {loading ? (
        <BookGridSkeleton count={12} />
      ) : books.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center">
          <div className="mb-4 text-6xl">📚</div>
          <h3 className="mb-1.5 text-lg font-semibold">Không tìm thấy sách</h3>
          <p className="mb-6 max-w-xs text-sm text-muted-foreground">
            Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm khác
          </p>
          <Button variant="outline" onClick={clearFilters} className="gap-2">
            <X className="h-4 w-4" />
            Xoá bộ lọc
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {!loading && totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            disabled={page <= 1}
            onClick={() => updateParams({ page: String(page - 1) })}
            aria-label="Trang trước"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {getPaginationItems().map((item, idx) =>
            item === '...' ? (
              <span key={`dots-${idx}`} className="px-1 text-sm text-muted-foreground">
                …
              </span>
            ) : (
              <Button
                key={item}
                variant={item === page ? 'default' : 'outline'}
                size="icon"
                className="h-9 w-9 text-sm"
                onClick={() => updateParams({ page: String(item) })}
                aria-current={item === page ? 'page' : undefined}
              >
                {item}
              </Button>
            )
          )}

          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            disabled={page >= totalPages}
            onClick={() => updateParams({ page: String(page + 1) })}
            aria-label="Trang sau"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-sm text-muted-foreground">Đang tải...</div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}