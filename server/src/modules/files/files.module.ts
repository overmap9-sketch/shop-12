import { Module } from '@nestjs/common';
import { FilesService } from './files.service.js';
import { FilesController } from './files.controller.js';
import { DataStoreModule } from '../../persistence/data-store.module.js';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule, DataStoreModule],
  providers: [FilesService],
  controllers: [FilesController],
  exports: [FilesService],
})
export class FilesModule {}
