import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { ProductSort } from '../../entities';
import { Grid, List, ArrowUpDown } from 'lucide-react';

interface CatalogControlsProps {
  sort: ProductSort;
  totalProducts: number;
  currentPage: number;
  limit: number;
  viewMode: 'grid' | 'list';
  onSortChange: (sort: ProductSort) => void;
  onViewModeChange: (mode: 'grid' | 'list') => void;
  loading?: boolean;
}

export function CatalogControls({
  sort,
  totalProducts,
  currentPage,
  limit,
  viewMode,
  onSortChange,
  onViewModeChange,
  loading = false
}: CatalogControlsProps) {
  const { t } = useTranslation();

  const sortOptions = [
    { value: 'dateAdded-desc', label: t('catalog.sort.newest', 'Newest First'), field: 'dateAdded', order: 'desc' as const },
    { value: 'dateAdded-asc', label: t('catalog.sort.oldest', 'Oldest First'), field: 'dateAdded', order: 'asc' as const },
    { value: 'title-asc', label: t('catalog.sort.nameAZ', 'Name: A to Z'), field: 'title', order: 'asc' as const },
    { value: 'title-desc', label: t('catalog.sort.nameZA', 'Name: Z to A'), field: 'title', order: 'desc' as const },
    { value: 'price-asc', label: t('catalog.sort.priceLowHigh', 'Price: Low to High'), field: 'price', order: 'asc' as const },
    { value: 'price-desc', label: t('catalog.sort.priceHighLow', 'Price: High to Low'), field: 'price', order: 'desc' as const },
    { value: 'rating-desc', label: t('catalog.sort.ratingHighLow', 'Rating: High to Low'), field: 'rating', order: 'desc' as const },
    { value: 'rating-asc', label: t('catalog.sort.ratingLowHigh', 'Rating: Low to High'), field: 'rating', order: 'asc' as const },
  ];

  const currentSortValue = `${sort.field}-${sort.order}`;
  
  const handleSortChange = (value: string) => {
    const option = sortOptions.find(opt => opt.value === value);
    if (option) {
      onSortChange({
        field: option.field,
        order: option.order
      });
    }
  };

  const getResultsText = () => {
    const start = (currentPage - 1) * limit + 1;
    const end = Math.min(currentPage * limit, totalProducts);
    
    if (totalProducts === 0) {
      return t('catalog.noResults', 'No products found');
    }
    
    return t('catalog.showingResults', 
      `Showing ${start}-${end} of ${totalProducts} products`,
      { start, end, total: totalProducts }
    );
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-card border rounded-lg">
      {/* Results count */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {getResultsText()}
        </span>
        {loading && (
          <Badge variant="outline" className="text-xs">
            {t('common.loading', 'Loading...')}
          </Badge>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {/* Sort */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <Select value={currentSortValue} onValueChange={handleSortChange} disabled={loading}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={t('catalog.sortBy', 'Sort by')} />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* View Mode */}
        <div className="flex items-center border rounded-md">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className="rounded-r-none border-r"
            aria-pressed={viewMode === 'grid'}
            aria-label={t('catalog.viewGrid', 'Grid view')}
            disabled={loading}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onViewModeChange('list')}
            className="rounded-l-none"
            aria-pressed={viewMode === 'list'}
            aria-label={t('catalog.viewList', 'List view')}
            disabled={loading}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
