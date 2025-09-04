export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
  image?: string;
  parentId?: string;
  children?: Category[];
  productCount: number;
  isActive: boolean;
  sortOrder: number;
}

export interface CategoryTree extends Category {
  children: CategoryTree[];
}

export interface CategoryFilter {
  parentId?: string;
  isActive?: boolean;
  hasProducts?: boolean;
}
