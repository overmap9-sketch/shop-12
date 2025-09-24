"use client";
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppSelector, useAppDispatch } from '../../core/hooks';
import { 
  selectCart, 
  selectCartItems, 
  selectCartLoading, 
  selectCartError,
  fetchCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from '../../features/cart/cartSlice';
import { Button } from '../../shared/ui/Button';
import { LoadingSpinner } from '../../shared/ui/LoadingSpinner';
import CheckoutButton from '../../components/CheckoutButton';
import { NotificationService } from '../../shared/lib/notifications';
import { useOrderTotal, useCurrency } from '../../hooks/use-currency';

export function Cart() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  
  const cart = useAppSelector(selectCart);
  const cartItems = useAppSelector(selectCartItems) || [];
  const loading = useAppSelector(selectCartLoading);
  const error = useAppSelector(selectCartError);

  // Calculate totals with currency formatting
  const orderTotal = useOrderTotal(cartItems.map(item => ({
    price: item.price || 0,
    quantity: item.quantity || 0
  })));

  // Get currency conversion function
  const { convertAndFormat } = useCurrency();

  const [couponCode, setCouponCode] = React.useState('');
  const [couponApplied, setCouponApplied] = React.useState<{ code?: string; discount?: number } | null>(null);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    try {
      const item = cartItems.find(item => item.id === itemId);
      const productName = item?.product?.title;

      if (newQuantity <= 0) {
        await dispatch(removeFromCart(itemId)).unwrap();
        NotificationService.removeFromCartSuccess(productName);
      } else {
        await dispatch(updateCartItem({ itemId, quantity: newQuantity })).unwrap();
        NotificationService.updateCartSuccess(productName);
      }
    } catch (error) {
      NotificationService.cartError(error instanceof Error ? error.message : 'Failed to update cart');
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      const item = cartItems.find(item => item.id === itemId);
      const productName = item?.product?.title;

      await dispatch(removeFromCart(itemId)).unwrap();
      NotificationService.removeFromCartSuccess(productName);
    } catch (error) {
      NotificationService.cartError(error instanceof Error ? error.message : 'Failed to remove item');
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        await dispatch(clearCart()).unwrap();
        NotificationService.clearCartSuccess();
      } catch (error) {
        NotificationService.cartError(error instanceof Error ? error.message : 'Failed to clear cart');
      }
    }
  };

  // Show loading state
  if (loading && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background py-12 pb-safe-bottom">
        <div className="container mx-auto px-4 flex items-center justify-center">
          <LoadingSpinner size="lg" text={t('common.loading')} />
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background py-12 pb-safe-bottom">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-destructive/10 border border-destructive text-destructive p-6 rounded-md text-center">
              <h2 className="text-lg font-semibold mb-2">Error Loading Cart</h2>
              <p className="mb-4">{error}</p>
              <Button onClick={() => dispatch(fetchCart())}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show empty cart state
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background py-12 pb-safe-bottom">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-24 h-24 mx-auto mb-6 text-foreground-muted">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 2.5M7 13l2.5 2.5" />
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold text-foreground mb-4">
              {t('cart.empty')}
            </h1>
            <p className="text-foreground-muted mb-8 text-lg">
              Your shopping cart is empty. Start shopping to add items to your cart.
            </p>
            
            <div className="space-y-4">
              <Button size="lg" asChild>
                <Link to="/catalog">Start Shopping</Link>
              </Button>
              
              <div className="flex justify-center gap-4">
                <Button variant="outline" asChild>
                  <Link to="/">Home</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/categories">Browse Categories</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Use currency-formatted totals from the hook
  const { subtotal, shipping, tax, total } = orderTotal;

  const applyCoupon = async () => {
    const { CartAPI } = await import('../../shared/api/cart');
    const { CouponsAPI } = await import('../../shared/api/coupons');
    const currentCart = await CartAPI.getCart();
    const validation = CouponsAPI.validate(couponCode.trim(), currentCart.items, currentCart.subtotal);
    if (!validation.valid) {
      alert(validation.reason || 'Invalid coupon');
      return;
    }
    // apply discount and optional free shipping
    currentCart.discount = validation.discount || 0;
    if (validation.freeShipping) currentCart.shipping = 0;
    currentCart.total = Math.max(0, currentCart.subtotal + currentCart.tax + currentCart.shipping - currentCart.discount);
    (await import('../../shared/lib/storage')).Storage.set((await import('../../shared/lib/storage')).STORAGE_KEYS.CART, currentCart);
    setCouponApplied({ code: couponCode.trim(), discount: currentCart.discount });
    dispatch(fetchCart());
  };

  const removeCoupon = async () => {
    const { CartAPI } = await import('../../shared/api/cart');
    const cart = await CartAPI.getCart();
    cart.discount = 0;
    (await import('../../shared/lib/storage')).Storage.set((await import('../../shared/lib/storage')).STORAGE_KEYS.CART, cart);
    setCouponApplied(null);
    setCouponCode('');
    dispatch(fetchCart());
  };

  return (
    <div className="min-h-screen bg-background py-12 pb-safe-bottom">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t('cart.title')}
          </h1>
          <p className="text-foreground-muted">
            {cartItems.length} {cartItems.length === 1 ? t('cart.item') : t('cart.items')} in your cart
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-card border border-border rounded-lg p-6">
                <div className="flex flex-col sm:flex-row gap-4 sm:items-start">
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-muted rounded-md overflow-hidden flex-shrink-0">
                    <img
                      src={item.product?.images?.[0] || '/placeholder.svg'}
                      alt={item.product?.title || 'Product'}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <Link 
                          to={`/product/${item.product?.slug || ''}`}
                          className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                        >
                          {item.product?.title || 'Unknown Product'}
                        </Link>
                        {item.product?.brand && (
                          <p className="text-sm text-foreground-muted">{item.product.brand}</p>
                        )}
                        <p className="text-sm text-foreground-muted">SKU: {item.product?.sku || 'N/A'}</p>
                      </div>
                      
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-foreground-muted hover:text-destructive transition-colors p-1"
                        aria-label="Remove item"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Quantity and Price */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-foreground-muted">{t('product.quantity')}:</span>
                        <div className="flex items-center border border-border rounded-md">
                          <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="h-10 w-10 inline-flex items-center justify-center hover:bg-surface-alt transition-colors"
                          aria-label="Decrease quantity"
                          disabled={loading}
                        >
                            -
                          </button>
                          <span className="px-3 py-1 bg-surface text-center min-w-[3rem]">
                            {item.quantity || 0}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            className="h-10 w-10 inline-flex items-center justify-center hover:bg-surface-alt transition-colors"
                            aria-label="Increase quantity"
                            disabled={loading || (item.product?.stock && item.quantity >= item.product.stock)}
                          >
                            +
                          </button>
                        </div>
                        {item.product?.stock && item.product.stock <= 5 && (
                          <span className="text-sm text-warning">
                            Only {item.product.stock} left in stock
                          </span>
                        )}
                      </div>

                      <div className="sm:text-right text-left">
                        <div className="text-lg font-semibold text-foreground">
                          {orderTotal.items[cartItems.indexOf(item)]?.formattedTotal.formatted || '$0.00'}
                        </div>
                        <div className="text-sm text-foreground-muted">
                          {orderTotal.items[cartItems.indexOf(item)]?.formattedPrice.formatted || '$0.00'} each
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Cart Actions */}
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center pt-4">
              <Button variant="outline" onClick={handleClearCart} disabled={loading}>
                Clear Cart
              </Button>
              
              <Button variant="ghost" asChild>
                <Link to="/catalog">{t('cart.continueShopping')}</Link>
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg p-6 lg:sticky lg:top-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-foreground-muted">{t('cart.subtotal')}</span>
                  <span className="text-foreground">{subtotal.formatted}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-foreground-muted">{t('cart.shipping')}</span>
                  <span className="text-foreground">
                    {shipping.amount === 0 ? 'Free' : shipping.formatted}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-foreground-muted">{t('cart.tax')}</span>
                  <span className="text-foreground">{tax.formatted}</span>
                </div>

                {couponApplied?.discount ? (
                  <div className="flex justify-between text-success">
                    <span>Discount{couponApplied.code ? ` (${couponApplied.code})` : ''}</span>
                    <span>- ${couponApplied.discount.toFixed(2)}</span>
                  </div>
                ) : null}

                <div className="mt-4">
                  <div className="flex gap-2">
                    <input
                      className="flex-1 px-3 py-2 border rounded-md"
                      placeholder="Coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <Button variant="outline" onClick={couponApplied ? removeCoupon : applyCoupon}>
                      {couponApplied ? 'Remove' : 'Apply'}
                    </Button>
                  </div>
                </div>

                <hr className="border-border mt-4" />

                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-foreground">{t('cart.total')}</span>
                  <span className="text-foreground">{total.formatted}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <div className="w-full mb-4">
                {/* Use CheckoutButton component to create Stripe session and redirect */}
                <CheckoutButton items={cartItems.map(ci => ({ productId: ci.product?.id || ci.product?.slug || '', quantity: ci.quantity }))} />
              </div>

              {/* Free Shipping Notice */}
              {subtotal.amount < 100 && subtotal.amount > 0 && (
                <div className="bg-info/10 border border-info text-info p-3 rounded-md text-sm">
                  <p className="font-medium">Free shipping on orders over $100!</p>
                  <p>Add {convertAndFormat(100 - subtotal.amount).formatted} more to qualify.</p>
                </div>
              )}

              {/* Security Notice */}
              <div className="mt-4 text-xs text-foreground-muted text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-9a2 2 0 00-2-2H6a2 2 0 00-2 2v9a2 2 0 002 2zm10-12V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Secure Checkout
                </div>
                <p>Your payment information is encrypted and secure.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
