import { Module } from '@nestjs/common';
import { CartController } from './cart.controller.js';
import { CartService } from './cart.service.js';
import { DataStoreModule } from '../../persistence/data-store.module.js';
import { ProductsModule } from '../products/products.module.js';

@Module({ imports: [DataStoreModule, ProductsModule], controllers: [CartController], providers: [CartService] })
export class CartModule {}
