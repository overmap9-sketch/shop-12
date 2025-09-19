import type { Product, ProductSearchParams, ProductsResponse } from '../../entities';
import { http } from './http';

export class ProductsAPI {
  static async getProducts(params: ProductSearchParams = {}): Promise<ProductsResponse> {
    const q = new URLSearchParams();
    if (params.query) q.set('q', params.query);
    if (params.filters?.category) q.set('category', params.filters.category);
    if (params.filters?.subcategory) q.set('subcategory', params.filters.subcategory);
    if (params.sort) { q.set('sortField', params.sort.field); q.set('sortOrder', params.sort.order); }
    q.set('page', String(params.page || 1));
    q.set('limit', String(params.limit || 12));
    return http.get(`/products?${q.toString()}`);
  }

  static async getProduct(id: string): Promise<Product | null> {
    return http.get(`/products/${id}`);
  }

  static async getProductBySlug(slug: string): Promise<Product | null> {
    const list = await this.getProducts({ query: slug, limit: 1 });
    return list.products[0] || null;
  }

  static async getFeaturedProducts(limit: number = 8): Promise<Product[]> {
    const res = await http.get(`/products?isFeatured=true&limit=${limit}`);
    return res.products;
  }

  static async getNewProducts(limit: number = 8): Promise<Product[]> {
    const res = await http.get(`/products?isNew=true&limit=${limit}`);
    return res.products;
  }

  static async getSaleProducts(limit: number = 8): Promise<Product[]> {
    const res = await http.get(`/products?isOnSale=true&limit=${limit}`);
    return res.products;
  }

  static async getRelatedProducts(productId: string, limit: number = 4): Promise<Product[]> {
    const current = await this.getProduct(productId);
    if (!current) return [];
    const res = await http.get(`/products?category=${encodeURIComponent(current.category)}&limit=${limit}`);
    return (res.products as Product[]).filter((p) => p.id !== productId).slice(0, limit);
  }

  static async createProduct(product: Omit<Product, 'id' | 'dateAdded' | 'dateModified'>): Promise<Product> {
    return http.post('/products', product);
  }

  static async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    return http.patch(`/products/${id}`, updates);
  }

  static async deleteProduct(id: string): Promise<boolean> {
    await http.delete(`/products/${id}`);
    return true;
  }
}
