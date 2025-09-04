export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  currency: string;
  images: string[];
  category: string;
  subcategory?: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  stock: number;
  sku: string;
  brand?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  features: string[];
  specifications: Record<string, string>;
  status: 'draft' | 'published' | 'archived' | 'discontinued';
  isNew: boolean;
  isFeatured: boolean;
  isOnSale: boolean;
  dateAdded: string;
  dateModified: string;
}

export interface ProductFilter {
  category?: string;
  subcategory?: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  brand?: string;
  tags?: string[];
  status?: 'draft' | 'published' | 'archived' | 'discontinued';
  isOnSale?: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
  inStock?: boolean;
  // Paint-specific filters (values are matched against specifications/tags)
  colorFamily?: string;      // e.g., White, Gray, Blue
  colorHex?: string;         // e.g., #FFFFFF
  finish?: string;           // e.g., Matte, Eggshell, Satin, Semi-Gloss, Gloss
  sheen?: string;            // same as finish for some products
  base?: string;             // e.g., Ultra White, Deep Base, Oil-Based
  application?: string;      // Interior, Exterior, or Interior/Exterior
  volume?: string;           // e.g., 1 qt, 1 gal, 5 gal
  lowVOC?: boolean;          // true to filter <= 50 g/L or tagged low-voc
}

export interface ProductSort {
  field: 'price' | 'rating' | 'dateAdded' | 'title';
  order: 'asc' | 'desc';
}

export interface ProductSearchParams {
  query?: string;
  filters?: ProductFilter;
  sort?: ProductSort;
  page?: number;
  limit?: number;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
