import { Module } from '@nestjs/common';
import { FavouritesController } from './favourites.controller.js';
import { FavouritesService } from './favourites.service.js';
import { JsonDbModule } from '../../persistence/json-db.module.js';
import { ProductsModule } from '../products/products.module.js';

@Module({ imports: [JsonDbModule, ProductsModule], controllers: [FavouritesController], providers: [FavouritesService] })
export class FavouritesModule {}
