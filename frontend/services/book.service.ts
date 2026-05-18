import type { Book, BookFilters, SortOption, PaginatedResponse } from '@/types';
import { apiRequest } from '@/services/api-client';

type BackendBook = {
  id: number;
  uuid: string;
  title: string;
  slug: string;
  author: string;
  price: number;
  image?: string | null;
  category_id?: string | null;
  admin_id?: number | null;
  description?: string | null;
  stock: number;
  created_at?: string | null;
};

function mapBook(book: BackendBook): Book {
  return {
    id: String(book.id),
    uuid: book.uuid,
    title: book.title,
    slug: book.slug,
    author: book.author,
    price: book.price,
    image: book.image || '/placeholder.svg',
    categoryId: book.category_id || 'uncategorized',
    description: book.description || '',
    stock: book.stock,
    createdAt: book.created_at || new Date().toISOString(),
  };
}

class BookService {
  async getAll(
    page: number = 1,
    limit: number = 12,
    filters?: BookFilters,
    sort?: SortOption
  ): Promise<PaginatedResponse<Book>> {
    const search = filters?.search?.trim();
    const backendBooks = await apiRequest<BackendBook[]>(
      `/books${search ? `?search=${encodeURIComponent(search)}` : ''}`
    );
    let result = backendBooks.map(mapBook);

    if (filters?.categoryId) result = result.filter((book) => book.categoryId === filters.categoryId);
    if (filters?.minPrice !== undefined) result = result.filter((book) => book.price >= filters.minPrice!);
    if (filters?.maxPrice !== undefined) result = result.filter((book) => book.price <= filters.maxPrice!);

    if (sort === 'price-asc') result.sort((a, b) => a.price - b.price);
    if (sort === 'price-desc') result.sort((a, b) => b.price - a.price);

    const total = result.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginatedData = result.slice(start, start + limit);

    return {
      data: paginatedData,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getById(id: string): Promise<Book | null> {
    try {
      const book = await apiRequest<BackendBook>(`/books/${id}`);
      return mapBook(book);
    } catch {
      return null;
    }
  }

  async getByUuid(uuid: string): Promise<Book | null> {
    try {
      const book = await apiRequest<BackendBook>(`/books/uuid/${uuid}`);
      return mapBook(book);
    } catch {
      return null;
    }
  }

  async getFeatured(limit: number = 8): Promise<Book[]> {
    const books = await apiRequest<BackendBook[]>('/books');
    return books.map(mapBook).slice(0, limit);
  }

  async getNew(limit: number = 8): Promise<Book[]> {
    const books = await apiRequest<BackendBook[]>('/books');
    return books.map(mapBook).slice(0, limit);
  }

  async getRelated(bookId: string, categoryId: string, limit: number = 4): Promise<Book[]> {
    const books = await apiRequest<BackendBook[]>('/books');
    return books
      .map(mapBook)
      .filter((book) => book.categoryId === categoryId && book.id !== bookId)
      .slice(0, limit);
  }

  async getByCategory(categoryId: string, limit?: number): Promise<Book[]> {
    const books = await apiRequest<BackendBook[]>('/books');
    const filtered = books.map(mapBook).filter((book) => book.categoryId === categoryId);
    return limit ? filtered.slice(0, limit) : filtered;
  }

  async create(data: Omit<Book, 'id' | 'uuid' | 'slug' | 'createdAt'>): Promise<Book> {
    const token = localStorage.getItem('bookstore-token');
    const created = await apiRequest<BackendBook>('/books', {
      method: 'POST',
      token,
      body: {
        title: data.title,
        author: data.author,
        description: data.description,
        price: data.price,
        image: data.image,
        category_id: data.categoryId,
        stock: data.stock,
      },
    });
    return mapBook(created);
  }

  async getMine(): Promise<Book[]> {
    const token = localStorage.getItem('bookstore-token');
    const backendBooks = await apiRequest<BackendBook[]>('/books/admin/mine', { token });
    return backendBooks.map(mapBook);
  }

  async update(id: string, data: Partial<Book>): Promise<Book> {
    const token = localStorage.getItem('bookstore-token');
    const updated = await apiRequest<BackendBook>(`/books/${id}`, {
      method: 'PUT',
      token,
      body: {
        title: data.title,
        author: data.author,
        description: data.description,
        price: data.price,
        image: data.image,
        category_id: data.categoryId,
        stock: data.stock,
      },
    });
    return mapBook(updated);
  }

  async delete(id: string): Promise<void> {
    const token = localStorage.getItem('bookstore-token');
    await apiRequest<void>(`/books/${id}`, { method: 'DELETE', token });
  }

  async getSoldCount(id: string): Promise<number> {
    try {
      const result = await apiRequest<{ book_id: number; sold: number }>(`/books/${id}/sold-count`);
      return result.sold;
    } catch {
      return 0;
    }
  }
}

export const bookService = new BookService();
