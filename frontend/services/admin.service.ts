import { apiRequest } from '@/services/api-client';

export type AdminOrderSummary = {
  id: number;
  total_amount: number;
  status: 'pending' | 'shipping' | 'completed' | 'cancelled';
  created_at: string;
};

export type AdminUserSummary = {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  is_active: boolean;
  created_at: string;
};

export type AdminOverviewStats = {
  total_books: number;
  total_users: number;
  active_users: number;
  total_orders: number;
  completed_orders: number;
  pending_orders: number;
  total_revenue: number;
  average_rating: number;
  total_reviews: number;
};

export type AdminOrderStats = {
  total_orders: number;
  total_revenue: number;
  completed_orders: number;
  pending_orders: number;
  recent_orders: AdminOrderSummary[];
};

export type AdminUserStats = {
  total_users: number;
  active_users: number;
  recent_users: AdminUserSummary[];
};

export type AdminReviewBookRatingRow = {
  book_id: number;
  title: string;
  average_rating: number;
  review_count: number;
};

type AdminBackendReview = {
  id: number;
  user_id: number;
  book_id: number;
  book_title?: string | null;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
  user?: { id: number; name: string } | null;
  replies?: { id: number; message: string; display_name: string; created_at: string }[];
};

class AdminService {
  private getToken() {
    return localStorage.getItem('bookstore-token');
  }

  async getOverviewStats(): Promise<AdminOverviewStats> {
    return apiRequest<AdminOverviewStats>('/admin/stats/overview', {
      token: this.getToken(),
    });
  }

  async getOrderStats(): Promise<AdminOrderStats> {
    return apiRequest<AdminOrderStats>('/admin/stats/orders', {
      token: this.getToken(),
    });
  }

  async getUserStats(): Promise<AdminUserStats> {
    return apiRequest<AdminUserStats>('/admin/stats/users', {
      token: this.getToken(),
    });
  }

  async getReviews(filters?: { rating?: number; bookId?: string }): Promise<AdminBackendReview[]> {
    const qs = new URLSearchParams();
    if (filters?.rating !== undefined) qs.set('rating', String(filters.rating));
    if (filters?.bookId) qs.set('book_id', filters.bookId);
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return apiRequest<AdminBackendReview[]>(`/admin/reviews${suffix}`, {
      token: this.getToken(),
    });
  }

  async getBookReviewAnalytics(): Promise<AdminReviewBookRatingRow[]> {
    return apiRequest<AdminReviewBookRatingRow[]>('/admin/reviews/book-analytics', {
      token: this.getToken(),
    });
  }

  async replyToReview(
    reviewId: number,
    body: { message: string; displayName: 'Store Team' | 'System Admin' | 'Customer Support' }
  ) {
    return apiRequest<{ id: number; message: string; display_name: string; created_at: string }>(
      `/admin/reviews/${reviewId}/reply`,
      {
        method: 'POST',
        token: this.getToken(),
        body: {
          message: body.message,
          display_name: body.displayName,
        },
      }
    );
  }
}

export const adminService = new AdminService();
