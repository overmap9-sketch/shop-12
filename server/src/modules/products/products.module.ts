import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller.js';
import { ProductsService } from './products.service.js';
import { DataStoreModule } from '../../persistence/data-store.module.js';
import { FilesModule } from '../files/files.module.js';

@Module({ imports: [DataStoreModule, FilesModule], controllers: [ProductsController], providers: [ProductsService] })
export class ProductsModule {}
