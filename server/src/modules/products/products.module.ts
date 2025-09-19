import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller.js';
import { ProductsService } from './products.service.js';
import { JsonDbModule } from '../../persistence/json-db.module.js';

@Module({ imports: [JsonDbModule], controllers: [ProductsController], providers: [ProductsService] })
export class ProductsModule {}
