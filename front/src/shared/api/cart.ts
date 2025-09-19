import type { Cart, CartItem, AddToCartRequest, UpdateCartItemRequest, CartSummary } from '../../entities';
import { http } from './http';

export class CartAPI {
  static async getCart(): Promise<Cart> {
    return http.get('/cart');
  }

  static async addToCart(request: AddToCartRequest): Promise<Cart> {
    return http.post('/cart/add', { ...request });
  }

  static async updateCartItem(request: UpdateCartItemRequest): Promise<Cart> {
    return http.patch(`/cart/item/${request.itemId}`, { quantity: request.quantity });
  }

  static async removeFromCart(itemId: string): Promise<Cart> {
    return http.delete(`/cart/item/${itemId}`);
  }

  static async clearCart(): Promise<Cart> {
    return http.post('/cart/clear', {});
  }

  static async getCartSummary(): Promise<CartSummary> {
    const cart = await this.getCart();
    return {
      itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: cart.subtotal,
      tax: cart.tax,
      shipping: cart.shipping,
      discount: cart.discount,
      total: cart.total,
      currency: cart.currency,
    };
  }
}
