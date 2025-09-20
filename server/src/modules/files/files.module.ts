import { Module } from '@nestjs/common';
import { FilesService } from './files.service.js';
import { FilesController } from './files.controller.js';
import { DataStoreModule } from '../../persistence/data-store.module.js';
import { ConfigModule } from '@nestjs/config';
import { JwtGuard, PermissionsGuard } from '../auth/guards.js';

@Module({
  imports: [ConfigModule, DataStoreModule],
  providers: [FilesService, JwtGuard, PermissionsGuard],
  controllers: [FilesController],
  exports: [FilesService, JwtGuard, PermissionsGuard],
})
export class FilesModule {}
