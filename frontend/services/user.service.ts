import type { UserProfile } from '@/types';
import { apiRequest } from '@/services/api-client';
import { adminService } from '@/services/admin.service';

type BackendUser = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  role: 'user' | 'admin' | 'super_admin';
  is_active: number;
  created_at: string;
};

function mapUser(user: BackendUser): UserProfile & { isActive: boolean; createdAt: string } {
  return {
    id: String(user.id),
    name: user.name,
    email: user.email,
    phone: user.phone || undefined,
    address: user.address || undefined,
    role: user.role,
    isActive: !!user.is_active,
    createdAt: user.created_at,
  };
}

class UserService {
  async getAll(): Promise<UserProfile[]> {
    const token = localStorage.getItem('bookstore-token');
    const users = await apiRequest<BackendUser[]>('/users/all', { token });
    return users.map(mapUser);
  }

  async getById(id: string): Promise<UserProfile | null> {
    const allUsers = await this.getAll();
    return allUsers.find((u) => u.id === id) || null;
  }

  async updateRole(id: string, role: 'user' | 'admin' | 'super_admin'): Promise<UserProfile> {
    const token = localStorage.getItem('bookstore-token');
    const user = await apiRequest<BackendUser>(`/users/${id}/role`, {
      method: 'PUT',
      token,
      body: { role },
    });
    return mapUser(user);
  }

  async toggleActive(id: string): Promise<{ isActive: boolean }> {
    const token = localStorage.getItem('bookstore-token');
    const user = await apiRequest<BackendUser>(`/users/${id}/active`, {
      method: 'PUT',
      token,
    });
    return { isActive: !!user.is_active };
  }

  async delete(id: string): Promise<void> {
    return;
  }

  async getStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    adminUsers: number;
  }> {
    const allUsers = await this.getAll();
    const stats = await adminService.getUserStats();
    return {
      totalUsers: stats.total_users,
      activeUsers: stats.active_users,
      adminUsers: allUsers.filter((u) => u.role === 'admin' || u.role === 'super_admin').length,
    };
  }
}

export const userService = new UserService();
