import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JsonDbModule } from '../../persistence/json-db.module.js';
import { ConfigModule } from '@nestjs/config';

@Module({ imports: [JsonDbModule, ConfigModule], controllers: [AuthController], providers: [AuthService] })
export class AuthModule {}
