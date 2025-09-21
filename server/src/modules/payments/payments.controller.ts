import { Controller, Post, Body, Req, Res, Inject } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { DATA_STORE, DataStore } from '../../persistence/data-store.js';

@Controller('payments')
export class PaymentsController {
  private stripe: Stripe;
  constructor(private readonly config: ConfigService, @Inject(DATA_STORE) private readonly db: DataStore) {
    const key = this.config.get<string>('STRIPE_SECRET_KEY') || '';
    this.stripe = new Stripe(key, { apiVersion: '2022-11-15' } as any);
  }

  @Post('create-checkout-session')
  async createCheckoutSession(@Body() body: any) {
    const { items = [], successUrl, cancelUrl, metadata } = body;

    // build line_items from products in data store
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

    const origin = (this.config.get('PUBLIC_ORIGIN') || 'http://localhost:3000').replace(/\/$/, '');

    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items,
      success_url: successUrl || `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${origin}/checkout/cancel`,
      metadata: metadata || {},
    } as any);

    // Save a pending order
    try {
      await this.db.insert('orders', {
        sessionId: session.id,
        status: 'pending',
        items,
        total: totalAmount,
        dateCreated: new Date().toISOString(),
      } as any);
    } catch (e) {
      // ignore persistence errors for now
    }

    return { id: session.id, url: session.url };
  }

  @Post('webhook')
  async webhook(@Req() req: Request, @Res() res: Response) {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
    let event: Stripe.Event;

    try {
      if (!webhookSecret) {
        // If no webhook secret is configured, try parsing the body as JSON
        event = req.body as Stripe.Event;
      } else {
        const raw = (req as any).rawBody || req.body;
        event = this.stripe.webhooks.constructEvent(raw, sig, webhookSecret);
      }
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error('Webhook signature verification failed.', err?.message || err);
      return res.status(400).send(`Webhook Error: ${err?.message || err}`);
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const sessionId = session.id;
      // mark order as paid
      try {
        const orders = await this.db.all<any>('orders');
        const order = orders.find(o => o.sessionId === sessionId);
        if (order) {
          await this.db.update('orders', order.id, { status: 'paid', dateModified: new Date().toISOString() } as any);
        }
      } catch (e) {
        // ignore
      }
    }

    res.json({ received: true });
  }
}
