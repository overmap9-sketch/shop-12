import type { BaseEntity } from './json-db.service.js';

export interface DataStore {
  all<T = any>(collection: string): Promise<T[]>;
  saveAll<T = any>(collection: string, rows: T[]): Promise<void>;
  findById<T extends BaseEntity>(collection: string, id: string): Promise<T | undefined>;
  insert<T extends BaseEntity>(collection: string, item: Omit<T, 'id'> & Partial<BaseEntity>): Promise<T>;
  update<T extends BaseEntity>(collection: string, id: string, patch: Partial<T>): Promise<T | undefined>;
  remove(collection: string, id: string): Promise<boolean>;
}

export const DATA_STORE = Symbol('DATA_STORE');
