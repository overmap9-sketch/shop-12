import type { Category, CategoryFilter, CategoryTree } from '../../entities';
import { http } from './http';

export class CategoriesAPI {
  static async getCategories(filters: CategoryFilter = {}): Promise<Category[]> {
    const q = new URLSearchParams();
    if (filters.parentId !== undefined) q.set('parentId', String(filters.parentId));
    if (filters.isActive !== undefined) q.set('isActive', String(filters.isActive));
    return http.get(`/categories?${q.toString()}`);
  }

  static async getCategory(id: string): Promise<Category | null> {
    return http.get(`/categories/${id}`);
  }

  static async getCategoryBySlug(slug: string): Promise<Category | null> {
    const list = await this.getCategories({});
    return list.find(c => c.slug === slug) || null;
  }

  static async getCategoryTree(): Promise<CategoryTree[]> {
    return http.get('/categories/tree');
  }

  static async getMainCategories(limit: number = 8): Promise<Category[]> {
    const list = await this.getCategories({ parentId: undefined, isActive: true });
    return list.slice(0, limit);
  }

  static async getSubcategories(parentId: string): Promise<Category[]> {
    return this.getCategories({ parentId, isActive: true });
  }

  static async createCategory(category: Omit<Category, 'id' | 'productCount'>): Promise<Category> {
    return http.post('/categories', category);
  }

  static async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    return http.patch(`/categories/${id}`, updates);
  }

  static async deleteCategory(id: string): Promise<boolean> {
    await http.delete(`/categories/${id}`);
    return true;
  }

  static async updateProductCounts(): Promise<void> {
    // No-op on client; server recalculation could be implemented if needed
    return;
  }
}
