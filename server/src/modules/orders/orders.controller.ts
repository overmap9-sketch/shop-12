import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { OrdersService } from './orders.service.js';

@Controller('orders')
export class OrdersController {
  constructor(private readonly svc: OrdersService) {}

  @Get()
  list(@Query('userId') userId?: string) { return this.svc.list(userId || 'guest'); }

  @Post()
  create(@Body() body: any) { return this.svc.create(body.userId || 'guest', body); }
}
