import type { CartItem } from '@/types';
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
  description?: string | null;
  stock: number;
};

type BackendCartItem = {
  id: number;
  quantity: number;
  book: BackendBook;
};

function mapCartItem(item: BackendCartItem): CartItem {
  return {
    id: String(item.id),
    quantity: item.quantity,
    book: {
      id: String(item.book.id),
      uuid: item.book.uuid,
      title: item.book.title,
      slug: item.book.slug,
      author: item.book.author,
      price: item.book.price,
      image: item.book.image || '/placeholder.svg',
      categoryId: item.book.category_id || 'uncategorized',
      description: item.book.description || '',
      stock: item.book.stock,
      createdAt: new Date().toISOString(),
    },
  };
}

class CartService {
  private getToken() {
    return localStorage.getItem('bookstore-token');
  }

  async getMyCart(): Promise<CartItem[]> {
    const rows = await apiRequest<BackendCartItem[]>('/cart', {
      token: this.getToken(),
    });
    return rows.map(mapCartItem);
  }

  async addItem(bookId: string, quantity: number): Promise<CartItem> {
    const row = await apiRequest<BackendCartItem>('/cart', {
      method: 'POST',
      token: this.getToken(),
      body: {
        book_id: Number(bookId),
        quantity,
      },
    });
    return mapCartItem(row);
  }

  async updateQuantity(cartItemId: string, quantity: number): Promise<CartItem> {
    const row = await apiRequest<BackendCartItem>(`/cart/${cartItemId}`, {
      method: 'PUT',
      token: this.getToken(),
      body: { quantity },
    });
    return mapCartItem(row);
  }

  async removeItem(cartItemId: string): Promise<void> {
    await apiRequest<void>(`/cart/${cartItemId}`, {
      method: 'DELETE',
      token: this.getToken(),
    });
  }
}

export const cartService = new CartService();
