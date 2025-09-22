import { Body, Controller, Get, Post, Query, Param, NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service.js';
import { PaymentsService } from '../payments/payments.service.js';

@Controller('orders')
export class OrdersController {
  constructor(private readonly svc: OrdersService, private readonly payments: PaymentsService) {}

  @Get()
  list(@Query('userId') userId?: string) { return this.svc.list(userId); }

  @Post()
  create(@Body() body: any) { return this.svc.create(body.userId || 'guest', body); }

  @Get('by-session/:sessionId')
  async bySession(@Param('sessionId') sessionId: string) {
    const order = await this.svc.findBySession(sessionId);
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  @Post(':orderId/retry-session')
  async retrySession(@Param('orderId') orderId: string, @Body() body: any) {
    const order = await this.svc.findById(orderId);
    if (!order) throw new NotFoundException('Order not found');

    const origin = process.env.PUBLIC_ORIGIN || 'http://localhost:3000';
    const successUrl = `${origin.replace(/\/$/, '')}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin.replace(/\/$/, '')}/checkout/cancel?session_id={CHECKOUT_SESSION_ID}`;

    const session = await this.payments.createCheckoutSession(order.items || [], successUrl, cancelUrl, { orderId: order.id });

    // Update order with new session id and status
    await this.svc.update(order.id, { sessionId: session.id, status: 'pending', dateModified: new Date().toISOString() } as any);

    return { id: session.id, url: session.url };
  }
}
