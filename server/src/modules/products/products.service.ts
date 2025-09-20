import { Injectable, Inject } from '@nestjs/common';
import { DATA_STORE, DataStore } from '../../persistence/data-store.js';

export interface Product {
  id: string; slug: string; title: string; description: string; price: number; originalPrice?: number;
  currency: string; images: string[]; category: string; subcategory?: string; tags: string[]; rating: number;
  reviewCount: number; stock: number; sku: string; brand?: string; features: string[]; specifications: Record<string,string>;
  status: 'draft'|'published'|'archived'|'discontinued'; isNew: boolean; isFeatured: boolean; isOnSale: boolean;
  dateCreated?: string; dateModified?: string;
}

@Injectable()
export class ProductsService {
  private readonly collection = 'products';
  constructor(@Inject(DATA_STORE) private readonly db: DataStore) {}

  list = async (query: any) => {
    const rows = await this.db.all<Product>(this.collection);
    let list = [...rows];
    const { q, category, subcategory, isFeatured, isNew, isOnSale, page = 1, limit = 12, sortField, sortOrder } = query;

    if (q) {
      const s = String(q).toLowerCase();
      list = list.filter(p => p.title.toLowerCase().includes(s) || p.description.toLowerCase().includes(s) || p.tags?.some(t=>t.toLowerCase().includes(s)));
    }
    if (category) list = list.filter(p => p.category === category);
    if (subcategory) list = list.filter(p => p.subcategory === subcategory);
    if (isFeatured !== undefined) list = list.filter(p => String(p.isFeatured) === String(isFeatured));
    if (isNew !== undefined) list = list.filter(p => String(p.isNew) === String(isNew));
    if (isOnSale !== undefined) list = list.filter(p => String(p.isOnSale) === String(isOnSale));

    if (sortField) {
      const field = String(sortField) as keyof Product;
      const order = String(sortOrder || 'asc');
      list.sort((a,b)=> (a[field] as any) < (b[field] as any) ? (order==='asc'?-1:1) : (a[field] as any) > (b[field] as any) ? (order==='asc'?1:-1) : 0);
    }

    const total = list.length;
    const start = (Number(page)-1) * Number(limit);
    const end = start + Number(limit);
    const items = list.slice(start, end);
    return { products: items, total, page: Number(page), limit: Number(limit), hasMore: end < total };
  }

  get = (id: string) => this.db.findById<Product>(this.collection, id);
  create = (data: Omit<Product,'id'>) => this.db.insert<Product>(this.collection, data as any);
  update = (id: string, patch: Partial<Product>) => this.db.update<Product>(this.collection, id, patch);
  remove = (id: string) => this.db.remove(this.collection, id);
}
