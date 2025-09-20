import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DATA_STORE } from './data-store.js';
import { JsonDbService } from './json-db.service.js';
import { SqlDbService } from './sql-db.service.js';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DATA_STORE,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const driver = (config.get<string>('STORAGE_DRIVER') || 'json').toLowerCase();
        if (driver === 'sequelize' || driver === 'postgres' || driver === 'postgresql' || driver === 'pg') {
          return new SqlDbService(config);
        }
        return new JsonDbService(config);
      },
    },
  ],
  exports: [DATA_STORE],
})
export class DataStoreModule {}
