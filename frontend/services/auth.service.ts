import type { User, UserProfile, LoginCredentials, RegisterData } from '@/types';
import { apiRequest } from '@/services/api-client';

type LoginResponse = {
  access_token: string;
  token_type: string;
};

class AuthService {
  async login(
    credentials: LoginCredentials
  ): Promise<{ user: UserProfile; token: string }> {
    const tokenResponse = await apiRequest<LoginResponse>('/users/login', {
      method: 'POST',
      body: {
        email: credentials.email,
        password: credentials.password,
      },
    });

    const user = await apiRequest<UserProfile>('/users/me', {
      token: tokenResponse.access_token,
    });

    return { user, token: tokenResponse.access_token };
  }

  async register(data: RegisterData): Promise<{ user: UserProfile; token: string }> {
    await apiRequest<User>('/users/register', {
      method: 'POST',
      body: {
        name: data.name,
        email: data.email,
        password: data.password,
      },
    });

    return this.login({ email: data.email, password: data.password });
  }

  async updateProfile(token: string, data: Partial<UserProfile>): Promise<UserProfile> {
    return apiRequest<UserProfile>('/users/me', {
      method: 'PUT',
      token,
      body: data,
    });
  }

  async getProfile(token: string): Promise<UserProfile> {
    return apiRequest<UserProfile>('/users/me', {
      token,
    });
  }

  async logout(): Promise<void> {
    return;
  }
}

export const authService = new AuthService();
