import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CartService } from './cart.service.js';
import { ProductsService } from '../products/products.service.js';

@Controller('cart')
export class CartController {
  constructor(private readonly svc: CartService, private readonly products: ProductsService) {}

  @Get()
  get(@Query('userId') userId?: string) { return this.svc.get(userId || 'guest'); }

  @Post('add')
  async add(@Body() body: any) {
    const product = await this.products.get(body.productId);
    if (!product) throw new Error('Product not found');
    return this.svc.add(body.userId || 'guest', product, Number(body.quantity||1));
  }

  @Patch('item/:id')
  update(@Param('id') id: string, @Body() body: any) { return this.svc.updateItem(body.userId || 'guest', id, Number(body.quantity)); }

  @Delete('item/:id')
  remove(@Param('id') id: string, @Query('userId') userId?: string) { return this.svc.removeItem(userId || 'guest', id); }

  @Post('clear')
  clear(@Body() body: any) { return this.svc.clear(body.userId || 'guest'); }
}
