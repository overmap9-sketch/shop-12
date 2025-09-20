import { randomUUID } from 'crypto';
import type { Product, Category, Cart, CartItem } from '../../src/entities';
import { mockProducts, mockCategories } from '../../src/shared/lib/mockData';

// Simple in-memory store for dev/demo
const products: Product[] = [...mockProducts];
const categories: Category[] = [...mockCategories];

const carts = new Map<string, Cart>();

function recalc(cart: Cart) {
  cart.subtotal = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
  cart.tax = cart.subtotal * 0.08;
  cart.shipping = cart.subtotal >= 100 ? 0 : 10;
  cart.total = Math.max(0, cart.subtotal + cart.tax + cart.shipping - cart.discount);
}

export const db = {
  // Products
  getProducts() {
    return products;
  },
  getProduct(id: string) {
    return products.find(p => p.id === id);
  },
  addProduct(input: Omit<Product, 'id' | 'dateAdded' | 'dateModified'>): Product {
    const now = new Date().toISOString();
    const row: Product = { ...input, id: randomUUID(), dateAdded: now, dateModified: now } as Product;
    products.push(row);
    return row;
  },
  updateProduct(id: string, patch: Partial<Product>) {
    const idx = products.findIndex(p => p.id === id);
    if (idx === -1) return undefined;
    const now = new Date().toISOString();
    products[idx] = { ...products[idx], ...patch, id, dateModified: now } as Product;
    return products[idx];
  },
  removeProduct(id: string) {
    const i = products.findIndex(p => p.id === id);
    if (i === -1) return false;
    products.splice(i, 1);
    return true;
  },

  // Categories
  getCategories() { return categories; },
  getCategory(id: string) { return categories.find(c => c.id === id); },
  addCategory(input: Omit<Category, 'id' | 'productCount'>): Category {
    const row: Category = { ...input, id: randomUUID(), productCount: input.productCount ?? 0 } as Category;
    categories.push(row);
    return row;
  },
  updateCategory(id: string, patch: Partial<Category>) {
    const idx = categories.findIndex(c => c.id === id);
    if (idx === -1) return undefined;
    categories[idx] = { ...categories[idx], ...patch, id } as Category;
    return categories[idx];
  },
  removeCategory(id: string) {
    const i = categories.findIndex(c => c.id === id);
    if (i === -1) return false;
    categories.splice(i, 1);
    return true;
  },

  // Cart
  ensureCart(userId = 'guest'): Cart {
    let cart = carts.get(userId);
    if (!cart) {
      const now = new Date().toISOString();
      cart = {
        id: randomUUID(), userId, items: [], subtotal: 0, tax: 0, shipping: 0, discount: 0, total: 0, currency: 'USD',
        dateCreated: now, dateModified: now,
      };
      carts.set(userId, cart);
    }
    return cart;
  },
  addToCart(userId: string, productId: string, quantity: number): Cart {
    const cart = this.ensureCart(userId);
    const product = this.getProduct(productId);
    if (!product) throw new Error('Product not found');
    const existing = cart.items.find(i => i.productId === productId);
    if (existing) existing.quantity += quantity; else {
      const item: CartItem = { id: randomUUID(), productId, product, quantity, price: product.price, dateAdded: new Date().toISOString() };
      cart.items.push(item);
    }
    cart.dateModified = new Date().toISOString();
    recalc(cart);
    return cart;
  },
  updateCartItem(userId: string, itemId: string, quantity: number): Cart {
    const cart = this.ensureCart(userId);
    const item = cart.items.find(i => i.id === itemId);
    if (!item) throw new Error('Item not found');
    if (quantity <= 0) cart.items = cart.items.filter(i => i.id !== itemId); else item.quantity = quantity;
    cart.dateModified = new Date().toISOString();
    recalc(cart);
    return cart;
  },
  clearCart(userId: string): Cart {
    const cart = this.ensureCart(userId);
    cart.items = [];
    recalc(cart);
    cart.dateModified = new Date().toISOString();
    return cart;
  },
};
