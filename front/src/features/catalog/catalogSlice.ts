import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product, ProductSearchParams, ProductsResponse, ProductFilter, ProductSort, Category } from '../../entities';
import { ProductsAPI, CategoriesAPI } from '../../shared/api';

interface CatalogState {
  // Products
  products: Product[];
  totalProducts: number;
  productsLoading: boolean;
  productsError: string | null;
  
  // Categories
  categories: Category[];
  categoriesLoading: boolean;
  categoriesError: string | null;
  
  // Search and filters
  searchQuery: string;
  filters: ProductFilter;
  sort: ProductSort;
  currentPage: number;
  hasMore: boolean;
  
  // Featured products
  featuredProducts: Product[];
  newProducts: Product[];
  saleProducts: Product[];
}

const initialState: CatalogState = {
  products: [],
  totalProducts: 0,
  productsLoading: false,
  productsError: null,
  
  categories: [],
  categoriesLoading: false,
  categoriesError: null,
  
  searchQuery: '',
  filters: {},
  sort: { field: 'dateAdded', order: 'desc' },
  currentPage: 1,
  hasMore: false,
  
  featuredProducts: [],
  newProducts: [],
  saleProducts: [],
};

// Async thunks
export const fetchProducts = createAsyncThunk(
  'catalog/fetchProducts',
  async (params: ProductSearchParams, { rejectWithValue }) => {
    try {
      return await ProductsAPI.getProducts(params);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch products');
    }
  }
);

export const fetchMoreProducts = createAsyncThunk(
  'catalog/fetchMoreProducts',
  async (params: ProductSearchParams, { rejectWithValue }) => {
    try {
      return await ProductsAPI.getProducts(params);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch more products');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'catalog/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      return await CategoriesAPI.getCategories({ isActive: true });
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch categories');
    }
  }
);

export const fetchFeaturedProducts = createAsyncThunk(
  'catalog/fetchFeaturedProducts',
  async (limit: number = 8, { rejectWithValue }) => {
    try {
      return await ProductsAPI.getFeaturedProducts(limit);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch featured products');
    }
  }
);

export const fetchNewProducts = createAsyncThunk(
  'catalog/fetchNewProducts',
  async (limit: number = 8, { rejectWithValue }) => {
    try {
      return await ProductsAPI.getNewProducts(limit);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch new products');
    }
  }
);

export const fetchSaleProducts = createAsyncThunk(
  'catalog/fetchSaleProducts',
  async (limit: number = 8, { rejectWithValue }) => {
    try {
      return await ProductsAPI.getSaleProducts(limit);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch sale products');
    }
  }
);

export const searchProducts = createAsyncThunk(
  'catalog/searchProducts',
  async (searchParams: ProductSearchParams, { rejectWithValue }) => {
    try {
      return await ProductsAPI.getProducts(searchParams);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to search products');
    }
  }
);

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.currentPage = 1; // Reset page when search changes
    },
    setFilters: (state, action: PayloadAction<ProductFilter>) => {
      state.filters = action.payload;
      state.currentPage = 1; // Reset page when filters change
    },
    updateFilters: (state, action: PayloadAction<Partial<ProductFilter>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.currentPage = 1; // Reset page when filters change
    },
    clearFilters: (state) => {
      state.filters = {};
      state.currentPage = 1;
    },
    setSort: (state, action: PayloadAction<ProductSort>) => {
      state.sort = action.payload;
      state.currentPage = 1; // Reset page when sort changes
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    clearProducts: (state) => {
      state.products = [];
      state.totalProducts = 0;
      state.currentPage = 1;
      state.hasMore = false;
    },
    clearErrors: (state) => {
      state.productsError = null;
      state.categoriesError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.productsLoading = true;
        state.productsError = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.productsLoading = false;
        state.products = action.payload.products;
        state.totalProducts = action.payload.total;
        state.hasMore = action.payload.hasMore;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.productsLoading = false;
        state.productsError = action.payload as string;
      })
      // Fetch more products (for infinite scroll)
      .addCase(fetchMoreProducts.pending, (state) => {
        state.productsLoading = true;
        state.productsError = null;
      })
      .addCase(fetchMoreProducts.fulfilled, (state, action) => {
        state.productsLoading = false;
        state.products = [...state.products, ...action.payload.products];
        state.totalProducts = action.payload.total;
        state.hasMore = action.payload.hasMore;
      })
      .addCase(fetchMoreProducts.rejected, (state, action) => {
        state.productsLoading = false;
        state.productsError = action.payload as string;
      })
      // Search products
      .addCase(searchProducts.pending, (state) => {
        state.productsLoading = true;
        state.productsError = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.productsLoading = false;
        state.products = action.payload.products;
        state.totalProducts = action.payload.total;
        state.hasMore = action.payload.hasMore;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.productsLoading = false;
        state.productsError = action.payload as string;
      })
      // Fetch categories
      .addCase(fetchCategories.pending, (state) => {
        state.categoriesLoading = true;
        state.categoriesError = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categoriesLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.categoriesLoading = false;
        state.categoriesError = action.payload as string;
      })
      // Fetch featured products
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.featuredProducts = action.payload;
      })
      // Fetch new products
      .addCase(fetchNewProducts.fulfilled, (state, action) => {
        state.newProducts = action.payload;
      })
      // Fetch sale products
      .addCase(fetchSaleProducts.fulfilled, (state, action) => {
        state.saleProducts = action.payload;
      });
  },
});

export const {
  setSearchQuery,
  setFilters,
  updateFilters,
  clearFilters,
  setSort,
  setCurrentPage,
  clearProducts,
  clearErrors,
} = catalogSlice.actions;

// Selectors
export const selectProducts = (state: { catalog: CatalogState }) => state.catalog.products;
export const selectProductsLoading = (state: { catalog: CatalogState }) => state.catalog.productsLoading;
export const selectProductsError = (state: { catalog: CatalogState }) => state.catalog.productsError;
export const selectTotalProducts = (state: { catalog: CatalogState }) => state.catalog.totalProducts;
export const selectHasMore = (state: { catalog: CatalogState }) => state.catalog.hasMore;

export const selectCategories = (state: { catalog: CatalogState }) => state.catalog.categories;
export const selectCategoriesLoading = (state: { catalog: CatalogState }) => state.catalog.categoriesLoading;

export const selectSearchQuery = (state: { catalog: CatalogState }) => state.catalog.searchQuery;
export const selectFilters = (state: { catalog: CatalogState }) => state.catalog.filters;
export const selectSort = (state: { catalog: CatalogState }) => state.catalog.sort;
export const selectCurrentPage = (state: { catalog: CatalogState }) => state.catalog.currentPage;

export const selectFeaturedProducts = (state: { catalog: CatalogState }) => state.catalog.featuredProducts;
export const selectNewProducts = (state: { catalog: CatalogState }) => state.catalog.newProducts;
export const selectSaleProducts = (state: { catalog: CatalogState }) => state.catalog.saleProducts;

export { catalogSlice };
