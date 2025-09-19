import { Module } from '@nestjs/common';
import { CartController } from './cart.controller.js';
import { CartService } from './cart.service.js';
import { JsonDbModule } from '../../persistence/json-db.module.js';
import { ProductsModule } from '../products/products.module.js';

@Module({ imports: [JsonDbModule, ProductsModule], controllers: [CartController], providers: [CartService] })
export class CartModule {}
