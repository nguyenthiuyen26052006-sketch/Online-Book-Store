import type { Book, Order, OrderStatus, SuperAdminDashboard, UserProfile } from '@/types';
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

type BackendOrderItem = {
  id: number;
  book_id: number;
  title: string;
  image?: string | null;
  quantity: number;
  price_at_purchase: number;
};

type BackendOrder = {
  id: number;
  total_amount: number;
  status: string;
  shipping_address?: string | null;
  phone?: string | null;
  payment_method?: 'cod' | 'banking' | null;
  note?: string | null;
  created_at: string;
  updated_at: string;
  items: BackendOrderItem[];
};

type BackendUser = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  role: 'user' | 'admin' | 'super_admin';
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
    createdAt: new Date().toISOString(),
  };
}

function normalizeOrderStatus(status: string): OrderStatus {
  const s = (status || '').toLowerCase();
  if (s === 'completed') return 'delivered';
  return s as OrderStatus;
}

function mapOrder(order: BackendOrder): Order {
  return {
    id: String(order.id),
    userId: '',
    totalAmount: order.total_amount,
    status: normalizeOrderStatus(order.status),
    shippingAddress: order.shipping_address || '',
    phone: order.phone || '',
    paymentMethod: (order.payment_method as 'cod' | 'banking') || 'cod',
    note: order.note || undefined,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    items: order.items.map((item) => ({
      bookId: String(item.book_id),
      title: item.title,
      price: item.price_at_purchase,
      quantity: item.quantity,
      image: item.image || '/placeholder.svg',
    })),
  };
}

function mapUser(user: BackendUser): UserProfile {
  return {
    id: String(user.id),
    name: user.name,
    email: user.email,
    phone: user.phone || undefined,
    address: user.address || undefined,
    role: user.role,
  };
}

class SuperAdminService {
  private getToken() {
    return localStorage.getItem('bookstore-token');
  }

  async getAllBooks(): Promise<Book[]> {
    const books = await apiRequest<BackendBook[]>('/super-admin/books', {
      token: this.getToken(),
    });
    return books.map(mapBook);
  }

  async getAllOrders(): Promise<Order[]> {
    const orders = await apiRequest<BackendOrder[]>('/super-admin/orders', {
      token: this.getToken(),
    });
    return orders.map(mapOrder);
  }

  async getAllUsers(): Promise<UserProfile[]> {
    const users = await apiRequest<BackendUser[]>('/super-admin/users', {
      token: this.getToken(),
    });
    return users.map(mapUser);
  }

  async updateUserRole(userId: string, role: 'user' | 'admin' | 'super_admin') {
    const user = await apiRequest<BackendUser>(`/super-admin/users/${userId}/role`, {
      method: 'PUT',
      token: this.getToken(),
      body: { role },
    });
    return mapUser(user);
  }

  async createStaffAccount(name: string, email: string, password: string, role: 'admin' | 'super_admin' = 'admin') {
    const user = await apiRequest<BackendUser>('/super-admin/users/create-staff', {
      method: 'POST',
      token: this.getToken(),
      body: { name, email, password, role },
    });
    return mapUser(user);
  }

  async getDashboard(): Promise<SuperAdminDashboard> {
    const data = await apiRequest<{
      total_revenue: number;
      total_orders: number;
      pending_orders: number;
      delivered_orders: number;
      total_users: number;
      new_users_30d: number;
      total_books: number;
      total_reviews: number;
      top_selling_books: { book_id: number; uuid: string; title: string; sold: number; price: number }[];
      most_reviewed_books: { book_id: number; uuid: string; title: string; review_count: number }[];
      sales_by_day: { day: string; orders: number; revenue: number }[];
      sales_by_month: { month: string; orders: number; revenue: number }[];
      recent_orders: { id: number; total_amount: number; status: string; created_at: string | null; item_count: number }[];
      recent_activities: { type: string; id: number; label: string; detail: string; at: string | null }[];
    }>('/super-admin/dashboard', { token: this.getToken() });

    return {
      totalRevenue: data.total_revenue,
      totalOrders: data.total_orders,
      pendingOrders: data.pending_orders,
      deliveredOrders: data.delivered_orders,
      totalUsers: data.total_users,
      newUsers30d: data.new_users_30d,
      totalBooks: data.total_books,
      totalReviews: data.total_reviews,
      topSellingBooks: data.top_selling_books.map((b) => ({
        bookId: b.book_id,
        uuid: b.uuid,
        title: b.title,
        sold: b.sold,
        price: b.price,
      })),
      mostReviewedBooks: data.most_reviewed_books.map((b) => ({
        bookId: b.book_id,
        uuid: b.uuid,
        title: b.title,
        reviewCount: b.review_count,
      })),
      salesByDay: data.sales_by_day.map((d) => ({
        day: d.day,
        orders: d.orders,
        revenue: d.revenue,
      })),
      salesByMonth: data.sales_by_month.map((m) => ({
        month: m.month,
        orders: m.orders,
        revenue: m.revenue,
      })),
      recentOrders: data.recent_orders.map((o) => ({
        id: o.id,
        totalAmount: o.total_amount,
        status: o.status,
        createdAt: o.created_at,
        itemCount: o.item_count,
      })),
      recentActivities: data.recent_activities.map((a) => ({
        type: a.type,
        id: a.id,
        label: a.label,
        detail: a.detail,
        at: a.at,
      })),
    };
  }

  // Category Management Methods
  async getAllCategories() {
    return apiRequest<any[]>('/super-admin/categories', {
      token: this.getToken(),
    });
  }

  async createCategory(name: string, description?: string, image?: string) {
    return apiRequest<any>('/super-admin/categories', {
      method: 'POST',
      token: this.getToken(),
      body: { name, description, image },
    });
  }

  async updateCategory(categoryId: string, name?: string, description?: string, image?: string) {
    return apiRequest<any>(`/super-admin/categories/${categoryId}`, {
      method: 'PUT',
      token: this.getToken(),
      body: { name, description, image },
    });
  }

  async deleteCategory(categoryId: string) {
    return apiRequest<void>(`/super-admin/categories/${categoryId}`, {
      method: 'DELETE',
      token: this.getToken(),
    });
  }
}

export const superAdminService = new SuperAdminService();
