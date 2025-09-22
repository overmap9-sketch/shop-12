"use client";
import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {ProductsAPI} from "../../shared/api";
import { useAppSelector, useAppDispatch } from '../../core/hooks.ts';
import { addToCart } from '../../features/cart/cartSlice.ts';
import { addToFavourites, removeFromFavourites, selectIsFavourite } from '../../features/favourites/favouritesSlice.ts';
import { fetchCategories, selectCategories } from '../../features/catalog/catalogSlice.ts';
import { Product } from '../../entities';
import { Button } from '../../shared/ui/Button';
import { Badge } from '../../components/ui/badge';
import { LoadingSpinner } from '../../shared/ui/LoadingSpinner';
import { ProductBreadcrumb } from '../../components/ProductBreadcrumb';
const ProductGrid = dynamic(() => import('../../widgets/product-grid/ProductGrid').then(m => m.ProductGrid), { ssr: false, loading: () => <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">{Array.from({length:4}).map((_,i)=>(<div key={i} className="bg-card border border-border rounded-lg overflow-hidden"><div className="aspect-square skeleton" /><div className="p-4 space-y-3"><div className="skeleton-text h-3 w-1/3" /><div className="skeleton-title" /><div className="skeleton-text h-5 w-1/2" /></div></div>))}</div> });
import { NotificationService } from '../../shared/lib/notifications.ts';
import { useProductPrice, useCurrency } from '../../hooks/use-currency.ts';
import {
  Heart,
  ShoppingCart,
  Star,
  Minus,
  Plus,
  Share2,
  ChevronLeft,
  ChevronRight,
  Home,
  Package,
  Truck,
  Shield,
  RotateCcw,
  Zap,
  Info
} from 'lucide-react';

export function ProductDetail({ serverId }: { serverId?: string }) {
  const params = useParams<{ id: string }>();
  const id = serverId || params?.id;
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [hoverPreviewIndex, setHoverPreviewIndex] = useState<number | null>(null);
  const [isImageZoomed, setIsImageZoomed] = useState(false);

  const isFavourite = useAppSelector(selectIsFavourite(product?.id || ''));
  const { convertAndFormat } = useCurrency();
  const categories = useAppSelector(selectCategories);

  const loadProduct = async () => {
    if (!id) {
      setError('Product not found');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let productData = await ProductsAPI.getProduct(id);

      // If not found by id, try by slug
      if (!productData) {
        try {
          productData = await ProductsAPI.getProductBySlug(id);
        } catch {}
      }

      if (!productData) {
        setError('Product not found');
        return;
      }

      setProduct(productData);

      // Load related products
      const related = await ProductsAPI.getRelatedProducts(productData.id, 4);
      setRelatedProducts(related);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    ( async () => {
      await loadProduct();
    })()
  }, [id]);

  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories.length]);

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      await dispatch(addToCart({ productId: product.id, quantity })).unwrap();
      NotificationService.addToCartSuccess(product.title);
    } catch (error) {
      NotificationService.cartError(error instanceof Error ? error.message : 'Failed to add to cart');
    }
  };

  const handleToggleFavourite = async () => {
    if (!product) return;

    try {
      if (isFavourite) {
        await dispatch(removeFromFavourites(product.id)).unwrap();
        NotificationService.removeFromFavouritesSuccess(product.title);
      } else {
        await dispatch(addToFavourites(product.id)).unwrap();
        NotificationService.addToFavouritesSuccess(product.title);
      }
    } catch (error) {
      NotificationService.favouritesError(error instanceof Error ? error.message : 'Failed to update favourites');
    }
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 0)) {
      setQuantity(newQuantity);
    }
  };

  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.title,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to clipboard
        navigator.clipboard.writeText(window.location.href);
        NotificationService.success('Link Copied', 'Product link copied to clipboard');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      NotificationService.success('Link Copied', 'Product link copied to clipboard');
    }
  };

  const productPricing = useProductPrice(product?.price || 0, product?.originalPrice);
  const { price, originalPrice, discount } = productPricing;

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4 flex items-center justify-center">
          <LoadingSpinner size="lg" text={t('product.loading', 'Loading product...')} />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-destructive/10 border border-destructive text-destructive p-6 rounded-md">
              <h2 className="text-lg font-semibold mb-2">
                {t('product.notFound', 'Product Not Found')}
              </h2>
              <p className="mb-4">{error || 'The product you are looking for does not exist.'}</p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => navigate(-1)}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  {t('common.goBack', 'Go Back')}
                </Button>
                <Link to="/catalog">
                  <Button>
                    {t('product.browseCatalog', 'Browse Catalog')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumbs */}
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 py-3">
          <ProductBreadcrumb product={product} />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Main Product Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
              <img
                src={(product.images[hoverPreviewIndex ?? activeImageIndex]) || '/placeholder.svg'}
                alt={product.title}
                className={`w-full h-full object-cover transition-transform duration-300 ${
                  isImageZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
                }`}
                onClick={() => setIsImageZoomed(!isImageZoomed)}
                loading="eager"
                fetchpriority="high"
                decoding="async"
                width={1200}
                height={1200}
              />

              {/* Image Navigation */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImageIndex(prev => prev > 0 ? prev - 1 : product.images.length - 1)}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setActiveImageIndex(prev => prev < product.images.length - 1 ? prev + 1 : 0)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isOnSale && discount?.percentage && discount.percentage > 0 && (
                  <Badge variant="destructive">
                    -{discount.percentage}% {t('product.sale', 'Sale')}
                  </Badge>
                )}
                {product.isNew && (
                  <Badge className="bg-green-500 hover:bg-green-600">
                    {t('product.new', 'New')}
                  </Badge>
                )}
                {product.isFeatured && (
                  <Badge className="bg-blue-500 hover:bg-blue-600">
                    {t('product.featured', 'Featured')}
                  </Badge>
                )}
              </div>
            </div>

            {/* Thumbnail Images */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImageIndex(index)}
                    onMouseEnter={() => setHoverPreviewIndex(index)}
                    onMouseLeave={() => setHoverPreviewIndex(null)}
                    className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-colors ${
                      index === activeImageIndex ? 'border-primary' : 'border-transparent hover:border-muted-foreground'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold text-foreground">{product.title}</h1>
                <button
                  onClick={handleShare}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                  title="Share product"
                >
                  <Share2 className="h-5 w-5" />
                </button>
              </div>

              {product.brand && (
                <p className="text-lg text-muted-foreground mb-2">by {product.brand}</p>
              )}

              {/* Rating and Reviews */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-lg font-medium ml-2">{product.rating}</span>
                </div>
                <span className="text-muted-foreground">
                  ({product.reviewCount} {t('product.reviews', 'reviews')})
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-foreground">
                  {price.formatted}
                </span>
                {originalPrice && discount?.percentage && discount.percentage > 0 && (
                  <span className="text-xl text-muted-foreground line-through">
                    {originalPrice.formatted}
                  </span>
                )}
              </div>
              {discount?.percentage && discount.percentage > 0 && (
                <p className="text-sm text-green-600 font-medium">
                  You save {discount.amount.formatted} ({discount.percentage}% off)
                </p>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className={`font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stock > 0 ? (
                  product.stock > 10 ? 'In Stock' : `Only ${product.stock} left in stock`
                ) : 'Out of Stock'}
              </span>
            </div>

            {/* Description */}
            <div>
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            {/* Paint Details */}
            <div className="border rounded-md p-4 bg-card/50">
              <h3 className="font-semibold text-foreground mb-3">Paint Details</h3>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                {product.specifications['Color Hex'] && (
                  <span
                    className="inline-flex items-center gap-2 px-2 py-1 rounded border bg-background"
                    title={product.specifications['Color'] || 'Color'}
                  >
                    <span
                      className="inline-block w-4 h-4 rounded-full border"
                      style={{ backgroundColor: product.specifications['Color Hex'] }}
                    />
                    {product.specifications['Color'] || 'Color'}
                  </span>
                )}
                {product.specifications['Finish'] && (
                  <span className="px-2 py-1 rounded border bg-background">{product.specifications['Finish']}</span>
                )}
                {product.specifications['Sheen'] && (
                  <span className="px-2 py-1 rounded border bg-background">{product.specifications['Sheen']}</span>
                )}
                {product.specifications['Base'] && (
                  <span className="px-2 py-1 rounded border bg-background">{product.specifications['Base']}</span>
                )}
                {product.specifications['Volume'] && (
                  <span className="px-2 py-1 rounded border bg-background">{product.specifications['Volume']}</span>
                )}
                {product.specifications['Coverage'] && (
                  <span className="px-2 py-1 rounded border bg-background">{product.specifications['Coverage']}</span>
                )}
                {product.specifications['Application'] && (
                  <span className="px-2 py-1 rounded border bg-background">{product.specifications['Application']}</span>
                )}
                {product.specifications['VOC g/L'] && (
                  <span className="px-2 py-1 rounded border bg-background">VOC: {product.specifications['VOC g/L']}</span>
                )}
              </div>
            </div>

            {/* Features */}
            {product.features.length > 0 && (
              <div>
                <h3 className="font-semibold text-foreground mb-3">Features</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-muted-foreground">
                      <Zap className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <span className="font-medium">Quantity:</span>
                <div className="flex items-center border rounded-md">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="p-2 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 font-medium min-w-[3rem] text-center">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock}
                    className="p-2 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1"
                  size="lg"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleToggleFavourite}
                  size="lg"
                  className={isFavourite ? 'text-red-500 border-red-500 hover:bg-red-50' : ''}
                >
                  <Heart className={`h-5 w-5 ${isFavourite ? 'fill-current' : ''}`} />
                </Button>
              </div>

              {/* Trust Signals */}
              <div className="border-t pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span>{t('product.trustSignals.warranty', '2-year warranty')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    <span>{t('product.trustSignals.freeShipping', {
                      amount: convertAndFormat(50).formatted
                    })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" />
                    <span>{t('product.trustSignals.easyReturns', 'Easy returns')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mb-12">
          <div className="border rounded-lg">
            {/* Specifications */}
            {Object.keys(product.specifications).length > 0 && (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-border last:border-b-0">
                      <span className="font-medium text-muted-foreground">{key}:</span>
                      <span className="text-foreground">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">
              {t('product.relatedProducts', 'Related Products')}
            </h2>
            <ProductGrid products={relatedProducts} columns={4} />
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetail;
