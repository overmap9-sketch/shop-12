import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller.js';
import { CategoriesService } from './categories.service.js';
import { DataStoreModule } from '../../persistence/data-store.module.js';
import { FilesModule } from '../files/files.module.js';

@Module({ imports: [DataStoreModule, FilesModule], controllers: [CategoriesController], providers: [CategoriesService] })
export class CategoriesModule {}
