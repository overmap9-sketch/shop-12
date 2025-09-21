import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import { Slider } from '../../components/ui/slider';
import { Badge } from '../../components/ui/badge';
import { ProductFilter, Category } from '../../entities';
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';

interface CatalogFiltersProps {
  searchQuery: string;
  filters: ProductFilter;
  categories: Category[];
  onSearchChange: (query: string) => void;
  onFiltersChange: (filters: ProductFilter) => void;
  onClearFilters: () => void;
  loading?: boolean;
}

export function CatalogFilters({
  searchQuery,
  filters,
  categories,
  onSearchChange,
  onFiltersChange,
  onClearFilters,
  loading = false
}: CatalogFiltersProps) {
  const { t } = useTranslation();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([filters.priceMin || 0, filters.priceMax || 1000]);

  const handleFilterChange = (key: keyof ProductFilter, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange(values);
    onFiltersChange({
      ...filters,
      priceMin: values[0],
      priceMax: values[1]
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.brand) count++;
    if (filters.priceMin !== undefined || filters.priceMax !== undefined) count++;
    if (filters.rating !== undefined) count++;
    if (filters.isOnSale) count++;
    if (filters.isNew) count++;
    if (filters.inStock) count++;
    if (filters.colorFamily) count++;
    if (filters.finish) count++;
    if (filters.sheen) count++;
    if (filters.base) count++;
    if (filters.application) count++;
    if (filters.volume) count++;
    if (filters.lowVOC) count++;
    return count;
  };

  const brands = ['ColorCrafters', 'ProFinish', 'WeatherGuard', 'SealPro', 'WoodGuard', 'ArtisanCoat', 'ProTools'];
  const colorFamilies = ['White', 'Gray', 'Blue', 'Green', 'Red', 'Yellow', 'Brown', 'Black', 'Beige'];
  const finishes = ['Flat', 'Matte', 'Eggshell', 'Satin', 'Semi-Gloss', 'Gloss'];
  const volumes = ['1 qt', '1 gal', '5 gal'];
  const applications = ['Interior', 'Exterior', 'Interior/Exterior'];

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder={t('catalog.searchPlaceholder', 'Search products...')}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
          disabled={loading}
        />
      </div>

      {/* Filters Toggle for Mobile */}
      <div className="lg:hidden">
        <Button
          variant="outline"
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          className="w-full justify-between"
        >
          <span className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            {t('catalog.filters', 'Filters')}
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </span>
          {isFiltersOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {/* Filters Panel */}
      <div className={`space-y-6 ${!isFiltersOpen ? 'hidden lg:block' : ''}`}>
        {/* Active Filters */}
        {getActiveFiltersCount() > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">{t('catalog.activeFilters', 'Active Filters')}</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearFilters}
                className="h-auto p-1 text-xs"
              >
                <X className="h-3 w-3 mr-1" />
                {t('catalog.clearAll', 'Clear All')}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.category && (
                <Badge variant="secondary" className="text-xs">
                  {filters.category}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => handleFilterChange('category', undefined)}
                  />
                </Badge>
              )}
              {filters.brand && (
                <Badge variant="secondary" className="text-xs">
                  {filters.brand}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => handleFilterChange('brand', undefined)}
                  />
                </Badge>
              )}
              {filters.colorFamily && (
                <Badge variant="secondary" className="text-xs">
                  {filters.colorFamily}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleFilterChange('colorFamily', undefined)} />
                </Badge>
              )}
              {filters.finish && (
                <Badge variant="secondary" className="text-xs">
                  {filters.finish}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleFilterChange('finish', undefined)} />
                </Badge>
              )}
              {filters.application && (
                <Badge variant="secondary" className="text-xs">
                  {filters.application}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleFilterChange('application', undefined)} />
                </Badge>
              )}
              {filters.volume && (
                <Badge variant="secondary" className="text-xs">
                  {filters.volume}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleFilterChange('volume', undefined)} />
                </Badge>
              )}
              {(filters.priceMin !== undefined || filters.priceMax !== undefined) && (
                <Badge variant="secondary" className="text-xs">
                  ${filters.priceMin || 0} - ${filters.priceMax || 1000}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => {
                      handleFilterChange('priceMin', undefined);
                      handleFilterChange('priceMax', undefined);
                      setPriceRange([0, 1000]);
                    }}
                  />
                </Badge>
              )}
              {filters.lowVOC && (
                <Badge variant="secondary" className="text-xs">
                  Low VOC
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleFilterChange('lowVOC', undefined)} />
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Categories */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">{t('catalog.category', 'Category')}</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="category-all"
                checked={!filters.category}
                onCheckedChange={() => handleFilterChange('category', undefined)}
              />
              <Label htmlFor="category-all" className="text-sm font-normal">
                {t('catalog.allCategories', 'All Categories')}
              </Label>
            </div>
            {categories.map(category => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category.id}`}
                  checked={filters.category === category.slug}
                  onCheckedChange={(checked) => 
                    handleFilterChange('category', checked ? category.slug : undefined)
                  }
                />
                <Label htmlFor={`category-${category.id}`} className="text-sm font-normal">
                  {category.name} ({category.productCount})
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">{t('catalog.priceRange', 'Price Range')}</Label>
          <div className="px-2">
            <Slider
              value={priceRange}
              onValueChange={handlePriceRangeChange}
              max={1000}
              min={0}
              step={10}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
          </div>
        </div>

        {/* Color Family */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Color Family</Label>
          <div className="flex flex-wrap gap-2">
            <button
              className={`px-2 py-1 rounded border text-xs ${!filters.colorFamily ? 'bg-muted' : ''}`}
              onClick={() => handleFilterChange('colorFamily', undefined)}
            >All</button>
            {colorFamilies.map(color => (
              <button
                key={color}
                className={`flex items-center gap-2 px-2 py-1 rounded border text-xs ${filters.colorFamily === color ? 'bg-primary text-primary-foreground' : ''}`}
                onClick={() => handleFilterChange('colorFamily', color)}
              >
                <span
                  className="inline-block w-4 h-4 rounded-full border"
                  style={{ backgroundColor: color.toLowerCase() === 'white' ? '#fff' : color.toLowerCase() === 'black' ? '#000' : undefined }}
                />
                {color}
              </button>
            ))}
          </div>
        </div>

        {/* Finish */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Finish</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="finish-all" checked={!filters.finish} onCheckedChange={() => handleFilterChange('finish', undefined)} />
              <Label htmlFor="finish-all" className="text-sm font-normal">All Finishes</Label>
            </div>
            {finishes.map(f => (
              <div key={f} className="flex items-center space-x-2">
                <Checkbox id={`finish-${f}`} checked={filters.finish === f} onCheckedChange={(checked) => handleFilterChange('finish', checked ? f : undefined)} />
                <Label htmlFor={`finish-${f}`} className="text-sm font-normal">{f}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Application */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Application</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="app-all" checked={!filters.application} onCheckedChange={() => handleFilterChange('application', undefined)} />
              <Label htmlFor="app-all" className="text-sm font-normal">All</Label>
            </div>
            {applications.map(a => (
              <div key={a} className="flex items-center space-x-2">
                <Checkbox id={`app-${a}`} checked={filters.application === a} onCheckedChange={(checked) => handleFilterChange('application', checked ? a : undefined)} />
                <Label htmlFor={`app-${a}`} className="text-sm font-normal">{a}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Volume */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Volume</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id="vol-all" checked={!filters.volume} onCheckedChange={() => handleFilterChange('volume', undefined)} />
              <Label htmlFor="vol-all" className="text-sm font-normal">All Sizes</Label>
            </div>
            {volumes.map(v => (
              <div key={v} className="flex items-center space-x-2">
                <Checkbox id={`vol-${v}`} checked={filters.volume === v} onCheckedChange={(checked) => handleFilterChange('volume', checked ? v : undefined)} />
                <Label htmlFor={`vol-${v}`} className="text-sm font-normal">{v}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Brand */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">{t('catalog.brand', 'Brand')}</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="brand-all"
                checked={!filters.brand}
                onCheckedChange={() => handleFilterChange('brand', undefined)}
              />
              <Label htmlFor="brand-all" className="text-sm font-normal">
                {t('catalog.allBrands', 'All Brands')}
              </Label>
            </div>
            {brands.map(brand => (
              <div key={brand} className="flex items-center space-x-2">
                <Checkbox
                  id={`brand-${brand}`}
                  checked={filters.brand === brand}
                  onCheckedChange={(checked) =>
                    handleFilterChange('brand', checked ? brand : undefined)
                  }
                />
                <Label htmlFor={`brand-${brand}`} className="text-sm font-normal">
                  {brand}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">{t('catalog.rating', 'Minimum Rating')}</Label>
          <div className="space-y-2">
            {[4, 3, 2, 1].map(rating => (
              <div key={rating} className="flex items-center space-x-2">
                <Checkbox
                  id={`rating-${rating}`}
                  checked={filters.rating === rating}
                  onCheckedChange={(checked) => 
                    handleFilterChange('rating', checked ? rating : undefined)
                  }
                />
                <Label htmlFor={`rating-${rating}`} className="text-sm font-normal flex items-center">
                  <span className="flex">
                    {Array.from({ length: 5 }, (_, i) => (
                      <span
                        key={i}
                        className={`text-sm ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      >
                        ★
                      </span>
                    ))}
                  </span>
                  <span className="ml-2">& up</span>
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Special Filters */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">{t('catalog.specialOffers', 'Special Offers')}</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="on-sale"
                checked={filters.isOnSale || false}
                onCheckedChange={(checked) => handleFilterChange('isOnSale', checked || undefined)}
              />
              <Label htmlFor="on-sale" className="text-sm font-normal">
                {t('catalog.onSale', 'On Sale')}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="new-products"
                checked={filters.isNew || false}
                onCheckedChange={(checked) => handleFilterChange('isNew', checked || undefined)}
              />
              <Label htmlFor="new-products" className="text-sm font-normal">
                {t('catalog.newProducts', 'New Products')}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="in-stock"
                checked={filters.inStock || false}
                onCheckedChange={(checked) => handleFilterChange('inStock', checked || undefined)}
              />
              <Label htmlFor="in-stock" className="text-sm font-normal">
                {t('catalog.inStock', 'In Stock Only')}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="low-voc"
                checked={filters.lowVOC || false}
                onCheckedChange={(checked) => handleFilterChange('lowVOC', checked || undefined)}
              />
              <Label htmlFor="low-voc" className="text-sm font-normal">
                Low VOC (≤ 50 g/L)
              </Label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
