import { Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { FavouritesService } from './favourites.service.js';
import { ProductsService } from '../products/products.service.js';

@Controller('favourites')
export class FavouritesController {
  constructor(private readonly svc: FavouritesService, private readonly products: ProductsService) {}

  @Get()
  list(@Query('userId') userId?: string) { return this.svc.list(userId || 'guest'); }

  @Post(':productId')
  async add(@Param('productId') productId: string, @Query('userId') userId?: string) {
    const p = await this.products.get(productId);
    if (!p) throw new Error('Product not found');
    return this.svc.add(userId || 'guest', p);
  }

  @Delete(':productId')
  remove(@Param('productId') productId: string, @Query('userId') userId?: string) { return this.svc.remove(userId || 'guest', productId); }

  @Post('clear')
  clear(@Query('userId') userId?: string) { return this.svc.clear(userId || 'guest'); }
}
