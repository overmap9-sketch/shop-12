import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DataStoreModule } from '../persistence/data-store.module.js';
import { ProductsModule } from './products/products.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { CartModule } from './cart/cart.module.js';
import { AuthModule } from './auth/auth.module.js';
import { FavouritesModule } from './favourites/favourites.module.js';
import { OrdersModule } from './orders/orders.module.js';
import { FilesModule } from './files/files.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DataStoreModule,
    AuthModule,
    ProductsModule,
    CategoriesModule,
    CartModule,
    FavouritesModule,
    OrdersModule,
    FilesModule,
  ],
})
export class AppModule {}
