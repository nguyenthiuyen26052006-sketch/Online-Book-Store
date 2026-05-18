import type { Review, ReviewReply } from '@/types';
import { apiRequest } from '@/services/api-client';

type BackendReply = {
  id: number;
  review_id: number;
  message: string;
  display_name: string;
  created_at: string;
};

type BackendReview = {
  id: number;
  user_id: number;
  book_id: number;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
  user?: { id: number; name: string } | null;
  replies?: BackendReply[];
};

function mapReply(r: BackendReply): ReviewReply {
  return {
    id: String(r.id),
    reviewId: String(r.review_id),
    message: r.message,
    displayName: r.display_name,
    createdAt: r.created_at,
  };
}

function mapReview(r: BackendReview): Review {
  return {
    id: String(r.id),
    bookId: String(r.book_id),
    userId: String(r.user_id),
    userName: r.user?.name ?? 'Độc giả',
    rating: r.rating,
    comment: r.comment,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    replies: r.replies?.map(mapReply) ?? [],
  };
}

class ReviewService {
  async getByBookId(bookId: string): Promise<Review[]> {
    const rows = await apiRequest<BackendReview[]>(`/books/${bookId}/reviews`);
    return rows.map(mapReview);
  }

  async getByUserId(userId: string, token: string | null): Promise<Review[]> {
    const rows = await apiRequest<BackendReview[]>(`/users/${userId}/reviews`, { token });
    return rows.map(mapReview);
  }

  async create(
    data: { bookId: string; rating: number; comment: string },
    token: string | null
  ): Promise<Review> {
    const created = await apiRequest<BackendReview>('/reviews', {
      method: 'POST',
      token,
      body: {
        book_id: Number(data.bookId),
        rating: data.rating,
        comment: data.comment,
      },
    });
    return mapReview(created);
  }

  async update(
    id: string,
    data: { rating: number; comment: string },
    token: string | null
  ): Promise<Review> {
    const updated = await apiRequest<BackendReview>(`/reviews/${id}`, {
      method: 'PUT',
      token,
      body: data,
    });
    return mapReview(updated);
  }

  async delete(id: string, token: string | null): Promise<void> {
    await apiRequest<void>(`/reviews/${id}`, { method: 'DELETE', token });
  }
}

export const reviewService = new ReviewService();
