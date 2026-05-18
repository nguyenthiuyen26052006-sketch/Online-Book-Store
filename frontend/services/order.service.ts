import type { Order, OrderStatus, CartItem, OrderTracking, OrderTrackingEntry } from '@/types';
import { apiRequest } from '@/services/api-client';
import { adminService } from '@/services/admin.service';

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

type BackendOrderTracking = {
  order_id: number;
  current_status: string;
  history: {
    id: number;
    status: string;
    changed_at: string;
    note?: string | null;
  }[];
};

function normalizeStatus(status: string): OrderStatus {
  const s = (status || '').toLowerCase();
  if (s === 'completed') return 'delivered';
  return s as OrderStatus;
}

function mapOrder(order: BackendOrder, userId: string = ''): Order {
  return {
    id: String(order.id),
    userId,
    totalAmount: order.total_amount,
    status: normalizeStatus(order.status),
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

function mapTracking(payload: BackendOrderTracking): OrderTracking {
  return {
    orderId: String(payload.order_id),
    currentStatus: normalizeStatus(payload.current_status),
    history: payload.history.map(
      (h): OrderTrackingEntry => ({
        id: String(h.id),
        status: normalizeStatus(h.status),
        changedAt: h.changed_at,
        note: h.note || undefined,
      })
    ),
  };
}

class OrderService {
  async getAll(): Promise<Order[]> {
    const token = localStorage.getItem('bookstore-token');
    const orders = await apiRequest<BackendOrder[]>('/orders/all', { token });
    return orders.map((o) => mapOrder(o));
  }

  async getById(id: string): Promise<Order | null> {
    const token = localStorage.getItem('bookstore-token');
    try {
      const order = await apiRequest<BackendOrder>(`/orders/${id}`, { token });
      return mapOrder(order);
    } catch {
      return null;
    }
  }

  async getTracking(orderId: string): Promise<OrderTracking | null> {
    const token = localStorage.getItem('bookstore-token');
    try {
      const raw = await apiRequest<BackendOrderTracking>(`/orders/${orderId}/tracking`, {
        token,
      });
      return mapTracking(raw);
    } catch {
      return null;
    }
  }

  async getByUserId(userId: string): Promise<Order[]> {
    const token = localStorage.getItem('bookstore-token');
    const orders = await apiRequest<BackendOrder[]>('/orders/me', { token });
    return orders.map((order) => mapOrder(order, userId));
  }

  async create(data: {
    userId: string;
    items: CartItem[];
    shippingAddress: string;
    phone: string;
    paymentMethod: 'cod' | 'banking';
    note?: string;
  }): Promise<Order> {
    const token = localStorage.getItem('bookstore-token');
    const created = await apiRequest<BackendOrder>('/orders', {
      method: 'POST',
      token,
      body: {
        items: data.items.map((item) => ({
          book_id: item.book.id,
          quantity: item.quantity,
        })),
        shipping_address: data.shippingAddress,
        phone: data.phone,
        payment_method: data.paymentMethod,
        note: data.note,
      },
    });
    return { ...mapOrder(created), userId: data.userId };
  }

  async updateStatus(id: string, status: OrderStatus, note?: string): Promise<Order> {
    const token = localStorage.getItem('bookstore-token');
    const updated = await apiRequest<BackendOrder>(`/admin/orders/${id}/status`, {
      method: 'PATCH',
      token,
      body: { status, note },
    });
    return mapOrder(updated);
  }

  async delete(id: string): Promise<void> {
    // Not supported by backend yet.
    return;
  }

  async getStats(): Promise<{
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    totalRevenue: number;
  }> {
    const stats = await adminService.getOrderStats();
    return {
      totalOrders: stats.total_orders,
      pendingOrders: stats.pending_orders,
      completedOrders: stats.completed_orders,
      totalRevenue: stats.total_revenue,
    };
  }
}

export const orderService = new OrderService();
