import { CartItem } from '../cart/model';

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  status: OrderStatus;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: PaymentMethod;
  shippingMethod: ShippingMethod;
  notes?: string;
  dateCreated: string;
  dateModified: string;
  dateShipped?: string;
  dateDelivered?: string;
  trackingNumber?: string;
}

export interface Address {
  id: string;
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'paypal' | 'stripe' | 'cash_on_delivery';
  cardLast4?: string;
  cardBrand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description?: string;
  price: number;
  estimatedDays: number;
  trackingAvailable: boolean;
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

export interface CreateOrderRequest {
  items: CartItem[];
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: PaymentMethod;
  shippingMethod: ShippingMethod;
  notes?: string;
}

export interface OrderFilter {
  status?: OrderStatus;
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
}
