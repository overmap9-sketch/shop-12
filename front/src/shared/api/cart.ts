import { Cart, CartItem, AddToCartRequest, UpdateCartItemRequest, CartSummary } from '../../entities';
import { Storage, STORAGE_KEYS } from '../lib/storage';
import { ProductsAPI } from './products';

const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

export class CartAPI {
  static async getCart(): Promise<Cart> {
    await delay();
    
    const cart = Storage.get<Cart>(STORAGE_KEYS.CART) || this.createEmptyCart();
    
    // Refresh product data for each cart item
    const updatedItems: CartItem[] = [];
    for (const item of (cart.items || [])) {
      const product = await ProductsAPI.getProduct(item.productId);
      if (product) {
        updatedItems.push({
          ...item,
          product,
          price: product.price, // Update price in case it changed
        });
      }
    }

    const updatedCart = {
      ...cart,
      items: updatedItems,
    };

    // Recalculate totals
    this.recalculateCart(updatedCart);
    Storage.set(STORAGE_KEYS.CART, updatedCart);

    return updatedCart;
  }

  static async addToCart(request: AddToCartRequest): Promise<Cart> {
    await delay();
    
    const product = await ProductsAPI.getProduct(request.productId);
    if (!product) {
      throw new Error('Product not found');
    }

    if (product.stock < request.quantity) {
      throw new Error('Insufficient stock');
    }

    const cart = await this.getCart();
    const existingItemIndex = cart.items.findIndex(item => item.productId === request.productId);

    if (existingItemIndex >= 0) {
      // Update existing item
      const existingItem = cart.items[existingItemIndex];
      const newQuantity = existingItem.quantity + request.quantity;
      
      if (newQuantity > product.stock) {
        throw new Error('Insufficient stock');
      }

      cart.items[existingItemIndex] = {
        ...existingItem,
        quantity: newQuantity,
      };
    } else {
      // Add new item
      const newItem: CartItem = {
        id: Date.now().toString(),
        productId: request.productId,
        product,
        quantity: request.quantity,
        price: product.price,
        dateAdded: new Date().toISOString(),
      };
      cart.items.push(newItem);
    }

    cart.dateModified = new Date().toISOString();
    this.recalculateCart(cart);
    Storage.set(STORAGE_KEYS.CART, cart);

    return cart;
  }

  static async updateCartItem(request: UpdateCartItemRequest): Promise<Cart> {
    await delay();
    
    const cart = await this.getCart();
    const itemIndex = cart.items.findIndex(item => item.id === request.itemId);

    if (itemIndex === -1) {
      throw new Error('Cart item not found');
    }

    if (request.quantity <= 0) {
      // Remove item
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      const item = cart.items[itemIndex];
      const product = await ProductsAPI.getProduct(item.productId);
      
      if (!product) {
        throw new Error('Product not found');
      }

      if (request.quantity > product.stock) {
        throw new Error('Insufficient stock');
      }

      cart.items[itemIndex] = {
        ...item,
        quantity: request.quantity,
      };
    }

    cart.dateModified = new Date().toISOString();
    this.recalculateCart(cart);
    Storage.set(STORAGE_KEYS.CART, cart);

    return cart;
  }

  static async removeFromCart(itemId: string): Promise<Cart> {
    await delay();
    
    const cart = await this.getCart();
    cart.items = cart.items.filter(item => item.id !== itemId);
    
    cart.dateModified = new Date().toISOString();
    this.recalculateCart(cart);
    Storage.set(STORAGE_KEYS.CART, cart);

    return cart;
  }

  static async clearCart(): Promise<Cart> {
    await delay();
    
    const cart = this.createEmptyCart();
    Storage.set(STORAGE_KEYS.CART, cart);
    return cart;
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

  private static createEmptyCart(): Cart {
    return {
      id: Date.now().toString(),
      items: [],
      subtotal: 0,
      tax: 0,
      shipping: 0,
      discount: 0,
      total: 0,
      currency: 'USD',
      dateCreated: new Date().toISOString(),
      dateModified: new Date().toISOString(),
    };
  }

  private static recalculateCart(cart: Cart): void {
    // Calculate subtotal
    cart.subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Calculate tax (8% for example)
    cart.tax = cart.subtotal * 0.08;

    // Calculate shipping (free over $100, $10 otherwise)
    cart.shipping = cart.subtotal >= 100 ? 0 : 10;

    // Apply discount (if any)
    // cart.discount would be set by coupon/promo code functionality

    // Calculate total
    cart.total = cart.subtotal + cart.tax + cart.shipping - cart.discount;

    // Ensure total is not negative
    cart.total = Math.max(0, cart.total);
  }
}
