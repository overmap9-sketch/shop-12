import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller.js';
import { CategoriesService } from './categories.service.js';
import { JsonDbModule } from '../../persistence/json-db.module.js';

@Module({ imports: [JsonDbModule], controllers: [CategoriesController], providers: [CategoriesService] })
export class CategoriesModule {}
