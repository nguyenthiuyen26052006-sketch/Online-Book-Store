import type { Category } from '@/types';
import { apiRequest } from '@/services/api-client';

type BackendCategory = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
};

function mapCategory(category: BackendCategory): Category {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description || undefined,
    image: category.image || undefined,
  };
}

class CategoryService {
  private getToken() {
    return localStorage.getItem('bookstore-token');
  }

  async getAll(): Promise<Category[]> {
    const categories = await apiRequest<BackendCategory[]>('/categories');
    return categories.map(mapCategory);
  }

  async getById(id: string): Promise<Category | null> {
    try {
      const category = await apiRequest<BackendCategory>(`/categories/${id}`);
      return mapCategory(category);
    } catch {
      return null;
    }
  }

  async getBySlug(slug: string): Promise<Category | null> {
    const allCategories = await this.getAll();
    return allCategories.find((cat) => cat.slug === slug) || null;
  }

  async create(data: Omit<Category, 'id' | 'slug'>): Promise<Category> {
    const created = await apiRequest<BackendCategory>('/categories', {
      method: 'POST',
      token: this.getToken(),
      body: {
        name: data.name,
        description: data.description,
        image: data.image,
      },
    });
    return mapCategory(created);
  }

  async update(id: string, data: Partial<Omit<Category, 'id' | 'slug'>>): Promise<Category> {
    const updated = await apiRequest<BackendCategory>(`/categories/${id}`, {
      method: 'PUT',
      token: this.getToken(),
      body: {
        name: data.name,
        description: data.description,
        image: data.image,
      },
    });
    return mapCategory(updated);
  }

  async delete(id: string): Promise<void> {
    await apiRequest<void>(`/categories/${id}`, {
      method: 'DELETE',
      token: this.getToken(),
    });
  }
}

export const categoryService = new CategoryService();
