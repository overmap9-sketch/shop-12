import { toast } from '../../hooks/use-toast';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationOptions {
  title?: string;
  description?: string;
  duration?: number;
}

const variants = {
  success: 'default' as const,
  error: 'destructive' as const,
  warning: 'default' as const,
  info: 'default' as const,
};

export class NotificationService {
  static show(type: NotificationType, options: NotificationOptions) {
    return toast({
      variant: variants[type],
      title: options.title,
      description: options.description,
      duration: options.duration || 5000,
    });
  }

  // Authentication notifications
  static loginSuccess(username?: string) {
    return this.show('success', {
      title: '✅ Login Successful',
      description: username ? `Welcome back, ${username}!` : 'Welcome back!',
    });
  }

  static loginError(message?: string) {
    return this.show('error', {
      title: '❌ Login Failed',
      description: message || 'Invalid credentials. Please try again.',
    });
  }

  static logoutSuccess() {
    return this.show('info', {
      title: '👋 Logged Out',
      description: 'You have been successfully logged out.',
    });
  }

  static registerSuccess() {
    return this.show('success', {
      title: '🎉 Registration Successful',
      description: 'Your account has been created successfully!',
    });
  }

  static registerError(message?: string) {
    return this.show('error', {
      title: '❌ Registration Failed',
      description: message || 'Failed to create account. Please try again.',
    });
  }

  // Cart notifications
  static addToCartSuccess(productName?: string) {
    return this.show('success', {
      title: '🛒 Added to Cart',
      description: productName ? `${productName} added to cart` : 'Product added to cart',
    });
  }

  static removeFromCartSuccess(productName?: string) {
    return this.show('info', {
      title: '🗑️ Removed from Cart',
      description: productName ? `${productName} removed from cart` : 'Product removed from cart',
    });
  }

  static updateCartSuccess(productName?: string) {
    return this.show('success', {
      title: '✏️ Cart Updated',
      description: productName ? `${productName} quantity updated` : 'Cart updated successfully',
    });
  }

  static clearCartSuccess() {
    return this.show('info', {
      title: '🧹 Cart Cleared',
      description: 'All items removed from cart',
    });
  }

  static cartError(message?: string) {
    return this.show('error', {
      title: '❌ Cart Error',
      description: message || 'Failed to update cart. Please try again.',
    });
  }

  // Favourites notifications
  static addToFavouritesSuccess(productName?: string) {
    return this.show('success', {
      title: '❤️ Added to Favourites',
      description: productName ? `${productName} added to favourites` : 'Product added to favourites',
    });
  }

  static removeFromFavouritesSuccess(productName?: string) {
    return this.show('info', {
      title: '💔 Removed from Favourites',
      description: productName ? `${productName} removed from favourites` : 'Product removed from favourites',
    });
  }

  static favouritesError(message?: string) {
    return this.show('error', {
      title: '❌ Favourites Error',
      description: message || 'Failed to update favourites. Please try again.',
    });
  }

  // General notifications
  static success(title: string, description?: string) {
    return this.show('success', { title, description });
  }

  static error(title: string, description?: string) {
    return this.show('error', { title, description });
  }

  static warning(title: string, description?: string) {
    return this.show('warning', { title, description });
  }

  static info(title: string, description?: string) {
    return this.show('info', { title, description });
  }

  // Loading and async operation notifications
  static loading(title: string, description?: string) {
    return this.show('info', {
      title: `⏳ ${title}`,
      description,
      duration: 10000, // Longer duration for loading states
    });
  }

  // Profile and settings notifications
  static profileUpdateSuccess() {
    return this.show('success', {
      title: '✅ Profile Updated',
      description: 'Your profile has been updated successfully',
    });
  }

  static passwordChangeSuccess() {
    return this.show('success', {
      title: '🔒 Password Changed',
      description: 'Your password has been updated successfully',
    });
  }

  // Order notifications
  static orderSuccess(orderId?: string) {
    return this.show('success', {
      title: '🎉 Order Placed',
      description: orderId ? `Order #${orderId} placed successfully` : 'Your order has been placed successfully',
    });
  }

  static orderError(message?: string) {
    return this.show('error', {
      title: '❌ Order Failed',
      description: message || 'Failed to place order. Please try again.',
    });
  }

  // Network and API error notifications
  static networkError() {
    return this.show('error', {
      title: '🌐 Network Error',
      description: 'Please check your internet connection and try again.',
    });
  }

  static serverError() {
    return this.show('error', {
      title: '🔧 Server Error',
      description: 'Something went wrong on our end. Please try again later.',
    });
  }

  // Validation notifications
  static validationError(message: string) {
    return this.show('warning', {
      title: '⚠️ Validation Error',
      description: message,
    });
  }

  // Permission notifications
  static permissionDenied() {
    return this.show('warning', {
      title: '🚫 Permission Denied',
      description: 'You do not have permission to perform this action.',
    });
  }

  static loginRequired() {
    return this.show('info', {
      title: '🔐 Login Required',
      description: 'Please log in to access this feature.',
    });
  }
}
