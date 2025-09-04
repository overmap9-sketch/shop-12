import { Product, ProductSearchParams, ProductsResponse, ProductFilter } from '../../entities';
import { Storage, STORAGE_KEYS } from '../lib/storage';
import { AuditAPI } from './audit';
import type { Product, ProductFilter, ProductSearchParams, ProductsResponse } from '../../entities';

// Mock delay to simulate API calls
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

export class ProductsAPI {
  static async getProducts(params: ProductSearchParams = {}): Promise<ProductsResponse> {
    await delay();
    
    const allProducts = Storage.get<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    let filteredProducts = [...allProducts];

    // Apply search query
    if (params.query) {
      const query = params.query.toLowerCase();
      filteredProducts = filteredProducts.filter(product =>
        product.title.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.tags.some(tag => tag.toLowerCase().includes(query)) ||
        product.brand?.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      );
    }

    // Apply filters
    if (params.filters) {
      filteredProducts = this.applyFilters(filteredProducts, params.filters);
    }

    // Apply sorting
    if (params.sort) {
      filteredProducts = this.applySorting(filteredProducts, params.sort);
    }

    // Apply pagination
    const page = params.page || 1;
    const limit = params.limit || 12;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    return {
      products: paginatedProducts,
      total: filteredProducts.length,
      page,
      limit,
      hasMore: endIndex < filteredProducts.length,
    };
  }

  static async getProduct(id: string): Promise<Product | null> {
    await delay();
    
    const products = Storage.get<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    return products.find(product => product.id === id) || null;
  }

  static async getProductBySlug(slug: string): Promise<Product | null> {
    await delay();
    
    const products = Storage.get<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    return products.find(product => product.slug === slug) || null;
  }

  static async getFeaturedProducts(limit: number = 8): Promise<Product[]> {
    await delay();
    
    const products = Storage.get<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    return products.filter(product => product.isFeatured).slice(0, limit);
  }

  static async getNewProducts(limit: number = 8): Promise<Product[]> {
    await delay();
    
    const products = Storage.get<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    return products.filter(product => product.isNew).slice(0, limit);
  }

  static async getSaleProducts(limit: number = 8): Promise<Product[]> {
    await delay();
    
    const products = Storage.get<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    return products.filter(product => product.isOnSale).slice(0, limit);
  }

  static async getRelatedProducts(productId: string, limit: number = 4): Promise<Product[]> {
    await delay();
    
    const products = Storage.get<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    const currentProduct = products.find(p => p.id === productId);
    
    if (!currentProduct) return [];

    // Find products in the same category excluding current product
    const relatedProducts = products
      .filter(product => 
        product.id !== productId && 
        product.category === currentProduct.category
      )
      .slice(0, limit);

    return relatedProducts;
  }

  static async createProduct(product: Omit<Product, 'id' | 'dateAdded' | 'dateModified'>): Promise<Product> {
    await delay();

    const products = Storage.get<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    const newProduct: Product = {
      ...product,
      status: product.status || 'draft',
      id: Date.now().toString(),
      dateAdded: new Date().toISOString(),
      dateModified: new Date().toISOString(),
    };

    products.push(newProduct);
    Storage.set(STORAGE_KEYS.PRODUCTS, products);

    AuditAPI.record({ action: 'create', entity: 'product', entityId: newProduct.id, after: newProduct });
    return newProduct;
  }

  static async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    await delay();
    
    const products = Storage.get<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    const index = products.findIndex(product => product.id === id);

    if (index === -1) return null;

    const before = { ...products[index] };
    products[index] = {
      ...products[index],
      ...updates,
      dateModified: new Date().toISOString(),
    };

    Storage.set(STORAGE_KEYS.PRODUCTS, products);
    AuditAPI.record({ action: 'update', entity: 'product', entityId: id, before, after: products[index] });
    return products[index];
  }

  static async deleteProduct(id: string): Promise<boolean> {
    await delay();

    const products = Storage.get<Product[]>(STORAGE_KEYS.PRODUCTS, []);
    const before = products.find(product => product.id === id) || null;
    const filteredProducts = products.filter(product => product.id !== id);

    if (filteredProducts.length === products.length) {
      return false; // Product not found
    }

    Storage.set(STORAGE_KEYS.PRODUCTS, filteredProducts);
    AuditAPI.record({ action: 'delete', entity: 'product', entityId: id, before });
    return true;
  }

  static async bulkUpdate(options: {
    filters?: ProductFilter;
    ids?: string[];
    price?: { mode: 'set' | 'increase_percent' | 'decrease_percent' | 'increase_amount' | 'decrease_amount'; value: number };
    stock?: { mode: 'set' | 'increase' | 'decrease'; value: number };
    flags?: { isOnSale?: boolean; isFeatured?: boolean; isNew?: boolean };
    setOriginalPriceFromPrice?: boolean;
  }): Promise<number> {
    await delay();
    const products = Storage.get<Product[]>(STORAGE_KEYS.PRODUCTS, []);

    let targets = products;
    if (options.filters) targets = this.applyFilters(targets, options.filters);
    if (options.ids && options.ids.length > 0) targets = targets.filter(p => options.ids!.includes(p.id));

    const updatedIds = new Set<string>();

    const applyPrice = (p: Product): Product => {
      if (!options.price) return p;
      let price = p.price;
      if (options.setOriginalPriceFromPrice) {
        p.originalPrice = p.price;
      }
      const { mode, value } = options.price;
      switch (mode) {
        case 'set':
          price = Math.max(0, value);
          break;
        case 'increase_percent':
          price = Math.max(0, price * (1 + value / 100));
          break;
        case 'decrease_percent':
          price = Math.max(0, price * (1 - value / 100));
          break;
        case 'increase_amount':
          price = Math.max(0, price + value);
          break;
        case 'decrease_amount':
          price = Math.max(0, price - value);
          break;
      }
      p.price = parseFloat(price.toFixed(2));
      return p;
    };

    const applyStock = (p: Product): Product => {
      if (!options.stock) return p;
      const { mode, value } = options.stock;
      let stock = p.stock || 0;
      switch (mode) {
        case 'set': stock = Math.max(0, Math.floor(value)); break;
        case 'increase': stock = Math.max(0, Math.floor(stock + value)); break;
        case 'decrease': stock = Math.max(0, Math.floor(stock - value)); break;
      }
      p.stock = stock;
      return p;
    };

    const applyFlags = (p: Product): Product => {
      if (!options.flags) return p;
      const { isOnSale, isFeatured, isNew } = options.flags;
      if (typeof isOnSale === 'boolean') p.isOnSale = isOnSale;
      if (typeof isFeatured === 'boolean') p.isFeatured = isFeatured;
      if (typeof isNew === 'boolean') p.isNew = isNew;
      return p;
    };

    const changes: Array<{ before: Product; after: Product }> = [];
    const next = products.map(p => {
      const target = targets.find(t => t.id === p.id);
      if (!target) return p;
      const before = { ...p };
      let result = { ...p } as Product;
      result = applyPrice(result);
      result = applyStock(result);
      result = applyFlags(result);
      if (JSON.stringify(before) !== JSON.stringify(result)) {
        result.dateModified = new Date().toISOString();
        updatedIds.add(result.id);
        changes.push({ before, after: result });
      }
      return result;
    });

    Storage.set(STORAGE_KEYS.PRODUCTS, next);
    changes.forEach(c => AuditAPI.record({ action: 'update', entity: 'product', entityId: c.after.id, before: c.before, after: c.after, metadata: { bulk: true } }));
    return updatedIds.size;
  }

  private static applyFilters(products: Product[], filters: ProductFilter): Product[] {
    const strEq = (a?: string, b?: string) => (a || '').toLowerCase() === (b || '').toLowerCase();
    const strIncl = (a?: string, b?: string) => (a || '').toLowerCase().includes((b || '').toLowerCase());

    return products.filter(product => {
      const spec = product.specifications || {} as Record<string, string>;
      const specVal = (key: string) => spec[key] || '';

      // Category filtering
      if (filters.category && product.category !== filters.category) return false;

      // Subcategory filtering
      if (filters.subcategory && product.subcategory !== filters.subcategory) return false;

      // Price filtering
      if (filters.priceMin !== undefined && product.price < filters.priceMin) return false;
      if (filters.priceMax !== undefined && product.price > filters.priceMax) return false;

      // Rating filtering
      if (filters.rating !== undefined && product.rating < filters.rating) return false;

      // Brand filtering
      if (filters.brand && product.brand !== filters.brand) return false;

      // Special product types
      if (filters.isOnSale !== undefined && product.isOnSale !== filters.isOnSale) return false;
      if (filters.isNew !== undefined && product.isNew !== filters.isNew) return false;
      if (filters.isFeatured !== undefined && product.isFeatured !== filters.isFeatured) return false;

      // Stock filtering
      if (filters.inStock !== undefined) {
        const inStock = product.stock > 0;
        if (inStock !== filters.inStock) return false;
      }

      // Status filtering
      if (filters.status && (product.status || 'published') !== filters.status) return false;

      // Tags filtering
      if (filters.tags && filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some(tag => product.tags.includes(tag));
        if (!hasMatchingTag) return false;
      }

      // Paint-specific filtering
      if (filters.colorFamily && !strEq(specVal('Color Family'), filters.colorFamily)) return false;
      if (filters.colorHex) {
        const hex = specVal('Color Hex');
        if (!hex || hex.toLowerCase() !== filters.colorHex.toLowerCase()) return false;
      }
      if (filters.finish && !(strEq(specVal('Finish'), filters.finish) || strEq(specVal('Sheen'), filters.finish))) return false;
      if (filters.sheen && !(strEq(specVal('Sheen'), filters.sheen) || strEq(specVal('Finish'), filters.sheen))) return false;
      if (filters.base && !strIncl(specVal('Base'), filters.base)) return false;
      if (filters.application && !strIncl(specVal('Application'), filters.application)) return false;
      if (filters.volume && !strEq(specVal('Volume'), filters.volume)) return false;
      if (filters.lowVOC === true) {
        const vocStr = specVal('VOC g/L');
        const tagLow = product.tags.some(t => t.toLowerCase() === 'low-voc');
        let vocOk = false;
        if (vocStr) {
          const num = parseFloat(vocStr.replace(/[^0-9.]/g, ''));
          if (!isNaN(num)) vocOk = num <= 50;
        }
        if (!vocOk && !tagLow) return false;
      }

      return true;
    });
  }

  private static applySorting(products: Product[], sort: { field: string; order: 'asc' | 'desc' }): Product[] {
    return products.sort((a, b) => {
      let aValue: any = a[sort.field as keyof Product];
      let bValue: any = b[sort.field as keyof Product];

      // Handle string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sort.order === 'asc' ? -1 : 1;
      if (aValue > bValue) return sort.order === 'asc' ? 1 : -1;
      return 0;
    });
  }
}
