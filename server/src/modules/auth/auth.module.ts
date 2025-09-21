import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { DataStoreModule } from '../../persistence/data-store.module.js';
import { ConfigModule } from '@nestjs/config';

@Module({ imports: [DataStoreModule, ConfigModule], controllers: [AuthController], providers: [AuthService] })
export class AuthModule {}
