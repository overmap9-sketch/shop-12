import { Storage, STORAGE_KEYS } from '../lib/storage';
import type { CartItem } from '../../entities';
import { Storage, STORAGE_KEYS } from '../lib/storage';
import { AuditAPI } from './audit';

export type CouponType = 'percentage' | 'fixed';

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number; // percent (0-100) or fixed currency amount
  minSubtotal?: number;
  maxDiscount?: number;
  expiresAt?: string; // ISO
  usageLimit?: number;
  usedCount: number;
  perUserLimit?: number;
  appliesTo?: {
    type: 'all' | 'categories' | 'products';
    categories?: string[]; // category slugs
    products?: string[]; // product IDs
  };
  isActive: boolean;
  freeShipping?: boolean;
}

const genId = () => `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const defaultCoupons: Coupon[] = [
  {
    id: genId(),
    code: 'WELCOME10',
    type: 'percentage',
    value: 10,
    minSubtotal: 50,
    usedCount: 0,
    isActive: true,
  }
];

export class CouponsAPI {
  static list(): Coupon[] {
    const list = Storage.get<Coupon[]>(STORAGE_KEYS.COUPONS);
    if (list) return list;
    Storage.set(STORAGE_KEYS.COUPONS, defaultCoupons);
    return defaultCoupons;
  }

  static getByCode(code: string): Coupon | null {
    const list = this.list();
    return list.find(c => c.code.toUpperCase() === code.toUpperCase()) || null;
    }

  static create(data: Omit<Coupon, 'id' | 'usedCount'>): Coupon {
    const list = this.list();
    const coupon: Coupon = { ...data, id: genId(), usedCount: 0 };
    Storage.set(STORAGE_KEYS.COUPONS, [...list, coupon]);
    AuditAPI.record({ action: 'create', entity: 'coupon', entityId: coupon.id, after: coupon });
    return coupon;
  }

  static update(id: string, patch: Partial<Coupon>): Coupon | null {
    const list = this.list();
    const idx = list.findIndex(c => c.id === id);
    if (idx === -1) return null;
    const before = { ...list[idx] } as Coupon;
    const updated = { ...list[idx], ...patch } as Coupon;
    const next = [...list];
    next[idx] = updated;
    Storage.set(STORAGE_KEYS.COUPONS, next);
    AuditAPI.record({ action: 'update', entity: 'coupon', entityId: id, before, after: updated });
    return updated;
  }

  static delete(id: string): boolean {
    const list = this.list();
    const before = list.find(c => c.id === id) || null;
    const next = list.filter(c => c.id !== id);
    Storage.set(STORAGE_KEYS.COUPONS, next);
    const removed = next.length !== list.length;
    if (removed) {
      AuditAPI.record({ action: 'delete', entity: 'coupon', entityId: id, before });
    }
    return removed;
  }

  static validate(code: string, items: CartItem[], subtotal: number): { valid: boolean; reason?: string; coupon?: Coupon; discount?: number; freeShipping?: boolean } {
    const coupon = this.getByCode(code);
    if (!coupon) return { valid: false, reason: 'Invalid code' };
    if (!coupon.isActive) return { valid: false, reason: 'Coupon inactive' };
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return { valid: false, reason: 'Coupon expired' };
    if (coupon.usageLimit !== undefined && coupon.usedCount >= coupon.usageLimit) return { valid: false, reason: 'Usage limit reached' };
    if (coupon.minSubtotal && subtotal < coupon.minSubtotal) return { valid: false, reason: `Minimum subtotal ${coupon.minSubtotal}` };

    // Applies-to logic
    let applicableSubtotal = subtotal;
    if (coupon.appliesTo && coupon.appliesTo.type !== 'all') {
      applicableSubtotal = items.reduce((sum, item) => {
        if (coupon.appliesTo?.type === 'categories') {
          if (coupon.appliesTo.categories?.includes(item.product.category)) {
            return sum + item.price * item.quantity;
          }
        } else if (coupon.appliesTo?.type === 'products') {
          if (coupon.appliesTo.products?.includes(item.productId)) {
            return sum + item.price * item.quantity;
          }
        }
        return sum;
      }, 0);
      if (applicableSubtotal <= 0) return { valid: false, reason: 'Coupon not applicable' };
    }

    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = (applicableSubtotal * coupon.value) / 100;
    } else {
      discount = coupon.value;
    }
    if (coupon.maxDiscount !== undefined) discount = Math.min(discount, coupon.maxDiscount);
    discount = Math.min(discount, subtotal);

    return { valid: true, coupon, discount, freeShipping: !!coupon.freeShipping };
  }
}
