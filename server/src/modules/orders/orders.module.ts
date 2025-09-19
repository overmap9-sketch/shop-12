import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller.js';
import { OrdersService } from './orders.service.js';
import { JsonDbModule } from '../../persistence/json-db.module.js';
import { CartModule } from '../cart/cart.module.js';

@Module({ imports: [JsonDbModule, CartModule], controllers: [OrdersController], providers: [OrdersService] })
export class OrdersModule {}
