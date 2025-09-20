import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { DATA_STORE, DataStore } from '../../persistence/data-store.js';
import type { Product } from '../products/products.service.js';
import { randomUUID } from 'crypto';

interface CartItem { id: string; productId: string; product: Product; quantity: number; price: number; dateAdded: string }
interface Cart { id: string; userId?: string; items: CartItem[]; subtotal: number; tax: number; shipping: number; discount: number; total: number; currency: string; dateCreated: string; dateModified: string }

@Injectable()
export class CartService {
  private readonly collection = 'carts';
  constructor(@Inject(DATA_STORE) private readonly db: DataStore) {}

  private async ensureCart(userId = 'guest'): Promise<Cart> {
    const list = await this.db.all<Cart>(this.collection);
    let cart = list.find(c => c.userId === userId);
    if (!cart) {
      cart = await this.db.insert<Cart>(this.collection, {
        id: undefined as any,
        userId,
        items: [],
        subtotal: 0, tax: 0, shipping: 0, discount: 0, total: 0, currency: 'USD',
        dateCreated: new Date().toISOString(), dateModified: new Date().toISOString(),
      } as any);
    }
    return cart;
  }

  private recalc(cart: Cart) {
    cart.subtotal = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
    cart.tax = cart.subtotal * 0.08;
    cart.shipping = cart.subtotal >= 100 ? 0 : 10;
    cart.total = Math.max(0, cart.subtotal + cart.tax + cart.shipping - cart.discount);
  }

  async get(userId?: string) {
    const cart = await this.ensureCart(userId);
    return cart;
  }

  async add(userId: string, product: Product, quantity: number) {
    const cart = await this.ensureCart(userId);
    const existing = cart.items.find(i => i.productId === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({ id: randomUUID(), productId: product.id, product, quantity, price: product.price, dateAdded: new Date().toISOString() });
    }
    cart.dateModified = new Date().toISOString();
    this.recalc(cart);
    // persist whole carts array
    const all = await this.db.all<Cart>(this.collection);
    const idx = all.findIndex(c => c.id === cart.id);
    all[idx] = cart;
    await this.db.saveAll(this.collection, all);
    return cart;
  }

  async updateItem(userId: string, itemId: string, quantity: number) {
    const cart = await this.ensureCart(userId);
    const item = cart.items.find(i => i.id === itemId);
    if (!item) throw new NotFoundException('Item not found');
    if (quantity <= 0) cart.items = cart.items.filter(i => i.id !== itemId);
    else item.quantity = quantity;
    cart.dateModified = new Date().toISOString();
    this.recalc(cart);
    const all = await this.db.all<Cart>(this.collection);
    const idx = all.findIndex(c => c.id === cart.id);
    all[idx] = cart;
    await this.db.saveAll(this.collection, all);
    return cart;
  }

  async removeItem(userId: string, itemId: string) {
    return this.updateItem(userId, itemId, 0);
  }

  async clear(userId: string) {
    const cart = await this.ensureCart(userId);
    cart.items = [];
    this.recalc(cart);
    const all = await this.db.all<Cart>(this.collection);
    const idx = all.findIndex(c => c.id === cart.id);
    all[idx] = cart;
    await this.db.saveAll(this.collection, all);
    return cart;
  }
}
