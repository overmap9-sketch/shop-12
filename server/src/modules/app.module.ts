import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JsonDbModule } from '../persistence/json-db.module.js';
import { ProductsModule } from './products/products.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { CartModule } from './cart/cart.module.js';
import { AuthModule } from './auth/auth.module.js';
import { FavouritesModule } from './favourites/favourites.module.js';
import { OrdersModule } from './orders/orders.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JsonDbModule,
    AuthModule,
    ProductsModule,
    CategoriesModule,
    CartModule,
    FavouritesModule,
    OrdersModule,
  ],
})
export class AppModule {}
