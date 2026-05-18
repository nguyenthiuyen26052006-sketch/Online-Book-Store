// Book Types
export interface Book {
  id: string;
  uuid: string;
  title: string;
  slug: string;
  author: string;
  price: number;
  image: string;
  categoryId: string;
  description: string;
  stock: number;
  createdAt: string;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  phone?: string;
  address?: string;
  role: 'user' | 'admin' | 'super_admin';
  isActive: boolean;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  address?: string;
  role: 'user' | 'admin' | 'super_admin';
}

// Cart Types
export interface CartItem {
  id?: string;
  book: Book;
  quantity: number;
}

// Order Types
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'shipping'
  | 'delivered'
  | 'cancelled'
  | 'completed';

export interface OrderItem {
  bookId: string;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: string;
  phone: string;
  paymentMethod: 'cod' | 'banking';
  note?: string;
  createdAt: string;
  updatedAt: string;
}

// Review Types
export interface ReviewReply {
  id: string;
  reviewId: string;
  message: string;
  displayName: string;
  createdAt: string;
}

export interface Review {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  replies?: ReviewReply[];
}

export interface SuperAdminDashboard {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  totalUsers: number;
  newUsers30d: number;
  totalBooks: number;
  totalReviews: number;
  topSellingBooks: { bookId: number; uuid: string; title: string; sold: number; price: number }[];
  mostReviewedBooks: { bookId: number; uuid: string; title: string; reviewCount: number }[];
  salesByDay: { day: string; orders: number; revenue: number }[];
  salesByMonth: { month: string; orders: number; revenue: number }[];
  recentOrders: { id: number; totalAmount: number; status: string; createdAt: string | null; itemCount: number }[];
  recentActivities: { type: string; id: number; label: string; detail: string; at: string | null }[];
}

export interface OrderTrackingEntry {
  id: string;
  status: OrderStatus;
  changedAt: string;
  note?: string;
}

export interface OrderTracking {
  orderId: string;
  currentStatus: OrderStatus;
  history: OrderTrackingEntry[];
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Filter & Sort Types
export interface BookFilters {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
}

export type SortOption = 'price-asc' | 'price-desc' | 'rating' | 'newest' | 'bestseller';

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalBooks: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  recentOrders: Order[];
  ordersByMonth: { month: string; orders: number; revenue: number }[];
}
