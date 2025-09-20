import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Sequelize, DataTypes, Model, InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import { randomUUID } from 'crypto';
import type { DataStore } from './data-store.js';
import type { BaseEntity } from './json-db.service.js';

class DocumentModel extends Model<InferAttributes<DocumentModel>, InferCreationAttributes<DocumentModel>> {
  declare id: CreationOptional<string>;
  declare collection: string;
  declare data: any;
  declare dateCreated: CreationOptional<Date>;
  declare dateModified: CreationOptional<Date>;
}

@Injectable()
export class SqlDbService implements DataStore, OnModuleInit {
  private readonly logger = new Logger(SqlDbService.name);
  private sequelize!: Sequelize;
  private Document!: typeof DocumentModel;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    const url = this.config.get<string>('DATABASE_URL');
    if (!url) {
      throw new Error('DATABASE_URL is required for Sequelize storage');
    }
    this.sequelize = new Sequelize(url, { logging: false, dialect: 'postgres' });
    this.Document = this.sequelize.define<DocumentModel>('Document', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      collection: { type: DataTypes.STRING, allowNull: false },
      data: { type: DataTypes.JSONB, allowNull: false },
      dateCreated: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      dateModified: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    }, {
      tableName: 'documents',
      timestamps: false,
      indexes: [{ fields: ['collection'] }],
    });

    await this.Document.sync();
    this.logger.log('Sequelize connected and documents table is ready');
  }

  private toEntity<T extends BaseEntity>(doc: DocumentModel): T {
    const data = doc.get('data') as any;
    const id = doc.get('id') as string;
    const dateCreated = (doc.get('dateCreated') as Date)?.toISOString();
    const dateModified = (doc.get('dateModified') as Date)?.toISOString();
    return { ...data, id, dateCreated, dateModified } as T;
  }

  async all<T = any>(collection: string): Promise<T[]> {
    const rows = await this.Document.findAll({ where: { collection } });
    return rows.map((r) => this.toEntity<T>(r));
  }

  async saveAll<T = any>(collection: string, rows: T[]): Promise<void> {
    await this.sequelize.transaction(async (t) => {
      await this.Document.destroy({ where: { collection }, transaction: t });
      const now = new Date();
      const docs = rows.map((row: any) => ({
        id: row.id || randomUUID(),
        collection,
        data: { ...row },
        dateCreated: row.dateCreated ? new Date(row.dateCreated) : now,
        dateModified: row.dateModified ? new Date(row.dateModified) : now,
      }));
      await this.Document.bulkCreate(docs as any, { transaction: t });
    });
  }

  async findById<T extends BaseEntity>(collection: string, id: string): Promise<T | undefined> {
    const row = await this.Document.findOne({ where: { collection, id } });
    return row ? this.toEntity<T>(row) : undefined;
    }

  async insert<T extends BaseEntity>(collection: string, item: Omit<T, 'id'> & Partial<BaseEntity>): Promise<T> {
    const now = new Date();
    const doc = await this.Document.create({
      id: (item as any).id || randomUUID(),
      collection,
      data: { ...(item as any) },
      dateCreated: now,
      dateModified: now,
    } as any);
    return this.toEntity<T>(doc);
  }

  async update<T extends BaseEntity>(collection: string, id: string, patch: Partial<T>): Promise<T | undefined> {
    const row = await this.Document.findOne({ where: { collection, id } });
    if (!row) return undefined;
    const next = { ...(row.get('data') as any), ...patch, id };
    row.set({ data: next, dateModified: new Date() });
    await row.save();
    return this.toEntity<T>(row);
  }

  async remove(collection: string, id: string): Promise<boolean> {
    const count = await this.Document.destroy({ where: { collection, id } });
    return count > 0;
  }
}
