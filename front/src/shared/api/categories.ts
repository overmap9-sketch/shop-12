import { Category, CategoryTree, CategoryFilter } from '../../entities';
import { Storage, STORAGE_KEYS } from '../lib/storage';
import { AuditAPI } from './audit';

const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

export class CategoriesAPI {
  static async getCategories(filters: CategoryFilter = {}): Promise<Category[]> {
    await delay();
    
    const categories = Storage.get<Category[]>(STORAGE_KEYS.CATEGORIES, []);
    let filteredCategories = [...categories];

    if (filters.parentId !== undefined) {
      filteredCategories = filteredCategories.filter(category => 
        category.parentId === filters.parentId
      );
    }

    if (filters.isActive !== undefined) {
      filteredCategories = filteredCategories.filter(category => 
        category.isActive === filters.isActive
      );
    }

    if (filters.hasProducts) {
      filteredCategories = filteredCategories.filter(category => 
        category.productCount > 0
      );
    }

    return filteredCategories.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  static async getCategory(id: string): Promise<Category | null> {
    await delay();
    
    const categories = Storage.get<Category[]>(STORAGE_KEYS.CATEGORIES, []);
    return categories.find(category => category.id === id) || null;
  }

  static async getCategoryBySlug(slug: string): Promise<Category | null> {
    await delay();
    
    const categories = Storage.get<Category[]>(STORAGE_KEYS.CATEGORIES, []);
    return categories.find(category => category.slug === slug) || null;
  }

  static async getCategoryTree(): Promise<CategoryTree[]> {
    await delay();
    
    const categories = Storage.get<Category[]>(STORAGE_KEYS.CATEGORIES, []);
    
    // Get root categories (no parent)
    const rootCategories = categories.filter(category => !category.parentId && category.isActive);
    
    // Build tree structure
    const buildTree = (parentId?: string): CategoryTree[] => {
      return categories
        .filter(category => category.parentId === parentId && category.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(category => ({
          ...category,
          children: buildTree(category.id),
        }));
    };

    return buildTree();
  }

  static async getMainCategories(limit: number = 8): Promise<Category[]> {
    const categories = await this.getCategories({ parentId: undefined, isActive: true });
    return categories.slice(0, limit);
  }

  static async getSubcategories(parentId: string): Promise<Category[]> {
    return this.getCategories({ parentId, isActive: true });
  }

  static async createCategory(category: Omit<Category, 'id' | 'productCount'>): Promise<Category> {
    await delay();
    
    const categories = Storage.get<Category[]>(STORAGE_KEYS.CATEGORIES, []);
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(),
      productCount: 0,
    };

    categories.push(newCategory);
    Storage.set(STORAGE_KEYS.CATEGORIES, categories);

    AuditAPI.record({ action: 'create', entity: 'category', entityId: newCategory.id, after: newCategory });
    return newCategory;
  }

  static async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    await delay();
    
    const categories = Storage.get<Category[]>(STORAGE_KEYS.CATEGORIES, []);
    const index = categories.findIndex(category => category.id === id);

    if (index === -1) return null;

    const before = { ...categories[index] };
    categories[index] = {
      ...categories[index],
      ...updates,
    };

    Storage.set(STORAGE_KEYS.CATEGORIES, categories);
    AuditAPI.record({ action: 'update', entity: 'category', entityId: id, before, after: categories[index] });
    return categories[index];
  }

  static async deleteCategory(id: string): Promise<boolean> {
    await delay();
    
    const categories = Storage.get<Category[]>(STORAGE_KEYS.CATEGORIES, []);
    const before = categories.find(c => c.id === id) || null;

    // Check if category has children
    const hasChildren = categories.some(category => category.parentId === id);
    if (hasChildren) {
      throw new Error('Cannot delete category with subcategories');
    }

    // Check if category has products
    const category = categories.find(c => c.id === id);
    if (category && category.productCount > 0) {
      throw new Error('Cannot delete category with products');
    }

    const filteredCategories = categories.filter(category => category.id !== id);

    if (filteredCategories.length === categories.length) {
      return false; // Category not found
    }

    Storage.set(STORAGE_KEYS.CATEGORIES, filteredCategories);
    AuditAPI.record({ action: 'delete', entity: 'category', entityId: id, before });
    return true;
  }

  // Update product count for categories (called when products are added/removed)
  static async updateProductCounts(): Promise<void> {
    const categories = Storage.get<Category[]>(STORAGE_KEYS.CATEGORIES, []);
    const products = Storage.get<any[]>(STORAGE_KEYS.PRODUCTS, []);

    // Reset all counts
    categories.forEach(category => {
      category.productCount = 0;
    });

    // Count products in each category
    products.forEach(product => {
      const category = categories.find(c => c.slug === product.category);
      if (category) {
        category.productCount++;
      }
    });

    Storage.set(STORAGE_KEYS.CATEGORIES, categories);
  }
}
