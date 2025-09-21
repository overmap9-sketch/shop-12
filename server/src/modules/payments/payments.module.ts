import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller.js';
import { PaymentsService } from './payments.service.js';
import { DataStoreModule } from '../../persistence/data-store.module.js';
import { ConfigModule } from '@nestjs/config';

@Module({ imports: [ConfigModule, DataStoreModule], controllers: [PaymentsController], providers: [PaymentsService], exports: [PaymentsService] })
export class PaymentsModule {}
