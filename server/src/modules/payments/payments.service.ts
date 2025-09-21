import { Injectable, Inject } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { DATA_STORE, DataStore } from '../../persistence/data-store.js';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;
  constructor(private readonly config: ConfigService, @Inject(DATA_STORE) private readonly db: DataStore) {
    const key = this.config.get<string>('STRIPE_SECRET_KEY') || '';
    this.stripe = new Stripe(key, { apiVersion: '2022-11-15' } as any);
  }

  getStripeInstance() {
    return this.stripe;
  }

  // utility to create session programmatically if needed by other modules
  async createCheckoutSession(items: any[], successUrl?: string, cancelUrl?: string, metadata?: any) {
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
    let totalAmount = 0;
    for (const it of items) {
      const prod = await this.db.findById<any>('products', it.productId);
      if (!prod) continue;
      const unit = Math.round((prod.price || 0) * 100);
      totalAmount += unit * (it.quantity || 1);
      line_items.push({
        price_data: {
          currency: (prod.currency || 'USD').toLowerCase(),
          product_data: { name: prod.title, metadata: { productId: prod.id } },
          unit_amount: unit,
        },
        quantity: it.quantity || 1,
      });
    }

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: metadata || {},
    } as any);

    return session;
  }
}
