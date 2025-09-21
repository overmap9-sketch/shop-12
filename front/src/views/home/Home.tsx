import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../../core/hooks';
import { 
  fetchFeaturedProducts, 
  fetchNewProducts, 
  fetchSaleProducts,
  selectFeaturedProducts,
  selectNewProducts,
  selectSaleProducts
} from '../../features/catalog/catalogSlice';
import { HeroSlider } from '../../widgets/hero-slider/HeroSlider';
import { ProductGrid } from '../../widgets/product-grid/ProductGrid';
import { CategoryGrid } from '../../widgets/category-grid/CategoryGrid';
import { SubcategoryShowcase, SubcategoryShowcaseCompact } from '../../widgets/subcategory-showcase/SubcategoryShowcase';
import { LoadingSpinner } from '../../shared/ui/LoadingSpinner';
import { Button } from '../../shared/ui/Button';
import { Link } from 'react-router-dom';

export function Home() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const featuredProducts = useAppSelector(selectFeaturedProducts);
  const newProducts = useAppSelector(selectNewProducts);
  const saleProducts = useAppSelector(selectSaleProducts);

  useEffect(() => {
    dispatch(fetchFeaturedProducts(8));
    dispatch(fetchNewProducts(8));
    dispatch(fetchSaleProducts(8));
  }, [dispatch]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSlider />

      {/* Categories Section */}
      <section className="py-16 bg-surface-alt">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              {t('navigation.categories')}
            </h2>
            <p className="text-foreground-muted max-w-2xl mx-auto">
              Discover our wide range of products across different categories
            </p>
          </div>
          <CategoryGrid />
        </div>
      </section>

      {/* Subcategory Showcase */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <SubcategoryShowcase />
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                {t('product.featured')} {t('product.products')}
              </h2>
              <p className="text-foreground-muted">
                Handpicked products just for you
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/catalog?featured=true">
                {t('common.viewAll')}
              </Link>
            </Button>
          </div>
          
          {featuredProducts.length > 0 ? (
            <ProductGrid products={featuredProducts} />
          ) : (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" text={t('common.loading')} />
            </div>
          )}
        </div>
      </section>

      {/* New Products */}
      <section className="py-16 bg-surface-alt">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                {t('product.new')} {t('product.products')}
              </h2>
              <p className="text-foreground-muted">
                Latest additions to our collection
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/catalog?new=true">
                {t('common.viewAll')}
              </Link>
            </Button>
          </div>
          
          {newProducts.length > 0 ? (
            <ProductGrid products={newProducts} />
          ) : (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" text={t('common.loading')} />
            </div>
          )}
        </div>
      </section>

      {/* Sale Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                {t('product.sale')} {t('product.products')}
              </h2>
              <p className="text-foreground-muted">
                Great deals and special offers
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/catalog?sale=true">
                {t('common.viewAll')}
              </Link>
            </Button>
          </div>
          
          {saleProducts.length > 0 ? (
            <ProductGrid products={saleProducts} />
          ) : (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" text={t('common.loading')} />
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Stay Updated
          </h2>
          <p className="text-lg mb-8 opacity-90">
            Subscribe to our newsletter for the latest products and exclusive offers
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-md bg-background text-foreground placeholder-foreground-muted focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button variant="secondary" size="lg">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
