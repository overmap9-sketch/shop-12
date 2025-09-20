import { Module } from '@nestjs/common';
import { FavouritesController } from './favourites.controller.js';
import { FavouritesService } from './favourites.service.js';
import { DataStoreModule } from '../../persistence/data-store.module.js';
import { ProductsModule } from '../products/products.module.js';

@Module({ imports: [DataStoreModule, ProductsModule], controllers: [FavouritesController], providers: [FavouritesService] })
export class FavouritesModule {}
