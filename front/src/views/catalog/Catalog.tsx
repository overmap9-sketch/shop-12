import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../../core/hooks';
import { 
  fetchProducts, 
  fetchCategories,
  selectProducts, 
  selectProductsLoading, 
  selectProductsError,
  selectCategories,
  selectCategoriesLoading,
  selectTotalProducts,
  selectHasMore,
  selectSearchQuery,
  selectFilters,
  selectSort,
  selectCurrentPage,
  setSearchQuery,
  setFilters,
  setSort,
  setCurrentPage,
  clearFilters,
  clearProducts
} from '../../features/catalog/catalogSlice';
import { ProductGrid } from '../../widgets/product-grid/ProductGrid';
import { LoadingSpinner } from '../../shared/ui/LoadingSpinner';
import { CatalogFilters } from './CatalogFilters';
import { CatalogControls } from './CatalogControls';
import { CatalogPagination } from './CatalogPagination';
import { SubcategoryNavigation, SubcategoryBreadcrumb } from '../../features/catalog/SubcategoryNavigation';
import { CategoryBreadcrumb } from '../../components/ProductBreadcrumb';
import { ProductFilter, ProductSort } from '../../entities';
import { useDebounce } from '../../hooks/use-debounce';
import { useSearchParams } from 'react-router-dom';

"use client";
import React, { useState, useEffect, useCallback } from 'react';
export function Catalog() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [limit, setLimit] = useState(12);

  // Get URL parameters
  const selectedCategory = searchParams.get('category') || undefined;
  const selectedSubcategory = searchParams.get('subcategory') || undefined;
  
  // Selectors
  const products = useAppSelector(selectProducts);
  const loading = useAppSelector(selectProductsLoading);
  const error = useAppSelector(selectProductsError);
  const categories = useAppSelector(selectCategories);
  const categoriesLoading = useAppSelector(selectCategoriesLoading);
  const totalProducts = useAppSelector(selectTotalProducts);
  const hasMore = useAppSelector(selectHasMore);
  const searchQuery = useAppSelector(selectSearchQuery);
  const filters = useAppSelector(selectFilters);
  const sort = useAppSelector(selectSort);
  const currentPage = useAppSelector(selectCurrentPage);

  // Debounced search
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Fetch data function
  const fetchData = useCallback(() => {
    const params = {
      page: currentPage,
      limit,
      query: debouncedSearchQuery || undefined,
      filters: {
        ...filters,
        ...(selectedCategory && { category: selectedCategory }),
        ...(selectedSubcategory && { subcategory: selectedSubcategory })
      },
      sort
    };

    dispatch(fetchProducts(params));
  }, [dispatch, currentPage, limit, debouncedSearchQuery, filters, sort, selectedCategory, selectedSubcategory]);

  // Initial load
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Fetch products when params change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handlers
  const handleSearchChange = (query: string) => {
    dispatch(setSearchQuery(query));
  };

  const handleFiltersChange = (newFilters: ProductFilter) => {
    dispatch(setFilters(newFilters));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    dispatch(setSearchQuery(''));
    setSearchParams({}); // Clear URL parameters
  };

  const handleCategoryChange = (categorySlug: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('category', categorySlug);
    newParams.delete('subcategory'); // Clear subcategory when category changes
    setSearchParams(newParams);
  };

  const handleSubcategoryChange = (subcategorySlug: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (selectedCategory) {
      newParams.set('category', selectedCategory);
    }
    newParams.set('subcategory', subcategorySlug);
    setSearchParams(newParams);
  };

  const handleSortChange = (newSort: ProductSort) => {
    dispatch(setSort(newSort));
  };

  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    dispatch(setCurrentPage(1)); // Reset to first page
  };

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
  };

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-destructive/10 border border-destructive text-destructive p-6 rounded-md text-center">
              <h2 className="text-lg font-semibold mb-2">
                {t('catalog.errorTitle', 'Error Loading Products')}
              </h2>
              <p className="mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90"
              >
                {t('catalog.retry', 'Try Again')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {(() => {
              const currentCategory = selectedCategory
                ? categories.find(cat => cat.slug === selectedCategory)
                : null;
              const currentSubcategory = selectedSubcategory
                ? categories.find(cat => cat.slug === selectedSubcategory)
                : null;

              if (currentSubcategory) {
                return currentSubcategory.name;
              } else if (currentCategory) {
                return currentCategory.name;
              } else {
                return t('catalog.title', 'Product Catalog');
              }
            })()}
          </h1>
          <p className="text-muted-foreground">
            {(() => {
              const currentCategory = selectedCategory
                ? categories.find(cat => cat.slug === selectedCategory)
                : null;
              const currentSubcategory = selectedSubcategory
                ? categories.find(cat => cat.slug === selectedSubcategory)
                : null;

              if (currentSubcategory) {
                return currentSubcategory.description || `Browse ${currentSubcategory.name.toLowerCase()}`;
              } else if (currentCategory) {
                return currentCategory.description || `Browse ${currentCategory.name.toLowerCase()}`;
              } else {
                return t('catalog.subtitle', 'Discover our amazing collection of products');
              }
            })()}
          </p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar - Navigation & Filters */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-8 space-y-6">
              {/* Subcategory Navigation */}
              <SubcategoryNavigation
                selectedCategory={selectedCategory}
                selectedSubcategory={selectedSubcategory}
                onCategoryChange={handleCategoryChange}
                onSubcategoryChange={handleSubcategoryChange}
              />

              {/* Filters */}
              <CatalogFilters
                searchQuery={searchQuery}
                filters={filters}
                categories={categories}
                onSearchChange={handleSearchChange}
                onFiltersChange={handleFiltersChange}
                onClearFilters={handleClearFilters}
                loading={loading || categoriesLoading}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Breadcrumb */}
            {selectedCategory && (
              <CategoryBreadcrumb
                categorySlug={selectedCategory}
                subcategorySlug={selectedSubcategory}
                className="mb-4"
              />
            )}

            {/* Mobile Navigation & Filters */}
            <div className="lg:hidden space-y-4">
              <SubcategoryNavigation
                selectedCategory={selectedCategory}
                selectedSubcategory={selectedSubcategory}
                onCategoryChange={handleCategoryChange}
                onSubcategoryChange={handleSubcategoryChange}
              />

              <CatalogFilters
                searchQuery={searchQuery}
                filters={filters}
                categories={categories}
                onSearchChange={handleSearchChange}
                onFiltersChange={handleFiltersChange}
                onClearFilters={handleClearFilters}
                loading={loading || categoriesLoading}
              />
            </div>

            {/* Controls */}
            <CatalogControls
              sort={sort}
              totalProducts={totalProducts}
              currentPage={currentPage}
              limit={limit}
              viewMode={viewMode}
              onSortChange={handleSortChange}
              onViewModeChange={handleViewModeChange}
              loading={loading}
            />

            {/* Products Grid/List */}
            {loading && products.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" text={t('catalog.loadingProducts', 'Loading products...')} />
              </div>
            ) : products.length > 0 ? (
              <ProductGrid 
                products={products} 
                loading={loading} 
                viewMode={viewMode}
                columns={viewMode === 'grid' ? 3 : 4}
              />
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-6 text-muted-foreground">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0H4m16 0l-2-2m0 0l-2 2m2-2v4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {t('catalog.noProductsTitle', 'No products found')}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {t('catalog.noProductsMessage', 'Try adjusting your search or filter criteria')}
                </p>
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  {t('catalog.clearFilters', 'Clear Filters')}
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalProducts > 0 && (
              <CatalogPagination
                currentPage={currentPage}
                totalProducts={totalProducts}
                limit={limit}
                hasMore={hasMore}
                onPageChange={handlePageChange}
                onLimitChange={handleLimitChange}
                loading={loading}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
