import { Controller, Post, Body, Req, Res, Inject, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { DATA_STORE, DataStore } from '../../persistence/data-store.js';

@Controller('payments')
export class PaymentsController {
  private stripe: Stripe;
  private readonly logger = new Logger(PaymentsController.name);

  constructor(private readonly config: ConfigService, @Inject(DATA_STORE) private readonly db: DataStore) {
    const key = this.config.get<string>('STRIPE_SECRET_KEY') || '';
    this.stripe = new Stripe(key, { apiVersion: '2022-11-15' } as any);
  }

  @Post('create-checkout-session')
  async createCheckoutSession(@Body() body: any) {
    const { items = [], successUrl, cancelUrl, metadata } = body;
    // Debug log for incoming create-checkout-session requests
    // eslint-disable-next-line no-console
    console.log('[payments] create-checkout-session body:', JSON.stringify({ items, successUrl, cancelUrl, metadata }).slice(0, 1000));

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
      cancel_url: cancelUrl || `${origin}/checkout/cancel?session_id={CHECKOUT_SESSION_ID}`,
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
      this.logger.error('Failed to persist pending order', e as any);
    }

    return { id: session.id, url: session.url };
  }

  @Post('webhook')
  async webhook(@Req() req: Request, @Res() res: Response) {
    const sig = req.headers['stripe-signature'] as string | undefined;
    const webhookSecret = this.config.get<string>('STRIPE_WEBHOOK_SECRET');
    let event: Stripe.Event;

    try {
      if (!webhookSecret) {
        // If no webhook secret is configured, try parsing the body as JSON (development only)
        event = req.body as Stripe.Event;
      } else {
        const raw = (req as any).rawBody || req.body;
        // raw must be the raw string or Buffer
        event = this.stripe.webhooks.constructEvent(raw, sig || '', webhookSecret);
      }
    } catch (err: any) {
      this.logger.error('Webhook signature verification failed.', err?.message || err);
      return res.status(400).send(`Webhook Error: ${err?.message || err}`);
    }

    // Idempotency: ignore events that were already processed
    try {
      const processed = await this.db.all<any>('stripe_events');
      const found = processed.find((e) => e.eventId === event.id);
      if (found) {
        this.logger.log(`Ignoring already processed event ${event.id}`);
        return res.json({ received: true, idempotent: true });
      }
    } catch (e) {
      // If event store check fails, log and continue (we still try to process)
      this.logger.warn('Failed to check stripe_events store for idempotency, continuing.', (e as any).message || e);
    }

    // Main event handling
    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          const sessionId = session.id;
          try {
            const orders = await this.db.all<any>('orders');
            const order = orders.find((o) => o.sessionId === sessionId);
            if (order) {
              const payment: any = {
                amount_received: (session.amount_total ?? session.amount_subtotal) || 0,
                currency: session.currency || 'usd',
                payment_intent: session.payment_intent || null,
                payment_status: (session as any).payment_status || 'paid',
              };
              const events = (order.events || []).concat([{ id: event.id, type: event.type, receivedAt: new Date().toISOString() }]);
              await this.db.update('orders', order.id, { status: 'paid', dateModified: new Date().toISOString(), payment, events } as any);
              this.logger.log(`Order ${order.id} marked as paid (session ${sessionId})`);
            } else {
              this.logger.warn(`No order found for session ${sessionId}`);
            }
          } catch (e) {
            this.logger.error('Failed to update order for checkout.session.completed', e as any);
          }
          break;
        }

        case 'checkout.session.expired':
        case 'checkout.session.async_payment_failed':
        case 'payment_intent.payment_failed': {
          // mark order as failed/cancelled but do not clear cart
          const session = event.data.object as any;
          const sessionId = session.id || (session.checkout_session && session.checkout_session.id) || null;
          try {
            if (sessionId) {
              const orders = await this.db.all<any>('orders');
              const order = orders.find((o) => o.sessionId === sessionId);
              if (order) {
                const events = (order.events || []).concat([{ id: event.id, type: event.type, receivedAt: new Date().toISOString() }]);
                await this.db.update('orders', order.id, { status: 'failed', dateModified: new Date().toISOString(), events } as any);
                this.logger.log(`Order ${order.id} marked as failed (session ${sessionId})`);
              }
            }
          } catch (e) {
            this.logger.error('Failed to update order for failed payment event', e as any);
          }
          break;
        }

        default:
          this.logger.log(`Unhandled stripe event type: ${event.type}`);
      }

      // Persist event id to event store for idempotency
      try {
        await this.db.insert('stripe_events', { eventId: event.id, type: event.type, processedAt: new Date().toISOString() } as any);
      } catch (e) {
        this.logger.warn('Failed to persist stripe event id for idempotency.', (e as any).message || e);
      }

    } catch (err) {
      this.logger.error('Error processing stripe webhook event', err as any);
      // still respond 200 to avoid repeated retries if the error is non-fatal, but in many cases you may want to return 500
      return res.status(500).send('Webhook processing error');
    }

    return res.json({ received: true });
  }
}
