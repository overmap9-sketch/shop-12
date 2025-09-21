import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import fsx from 'fs-extra';
import { join, resolve } from 'path';
import { randomUUID } from 'crypto';

export interface BaseEntity { id: string; dateCreated?: string; dateModified?: string }

@Injectable()
export class JsonDbService {
  private readonly logger = new Logger(JsonDbService.name);
  private readonly dataDir: string;

  constructor(private readonly config: ConfigService) {
    const dir = this.config.get<string>('DATA_DIR') || './data';
    this.dataDir = resolve(process.cwd(), dir);
  }

  private async filePath(collection: string) {
    await fsx.ensureDir(this.dataDir);
    return join(this.dataDir, `${collection}.json`);
  }

  async all<T = any>(collection: string): Promise<T[]> {
    const file = await this.filePath(collection);
    if (!(await fsx.pathExists(file))) {
      await fsx.writeJSON(file, [], { spaces: 2 });
      return [];
    }
    const arr = await fsx.readJSON(file);
    return Array.isArray(arr) ? (arr as T[]) : [];
  }

  async saveAll<T = any>(collection: string, rows: T[]): Promise<void> {
    const file = await this.filePath(collection);
    await fsx.writeJSON(file, rows, { spaces: 2 });
  }

  async findById<T extends BaseEntity>(collection: string, id: string): Promise<T | undefined> {
    const rows = await this.all<T>(collection);
    return rows.find((r) => (r as any).id === id);
  }

  async insert<T extends BaseEntity>(collection: string, item: Omit<T, 'id'> & Partial<BaseEntity>): Promise<T> {
    const rows = await this.all<T>(collection);
    const now = new Date().toISOString();
    const row: T = { ...(item as any), id: (item as any).id || randomUUID(), dateCreated: now, dateModified: now } as T;
    rows.push(row);
    await this.saveAll(collection, rows);
    return row;
  }

  async update<T extends BaseEntity>(collection: string, id: string, patch: Partial<T>): Promise<T | undefined> {
    const rows = await this.all<T>(collection);
    const idx = rows.findIndex((r) => (r as any).id === id);
    if (idx === -1) return undefined;
    const now = new Date().toISOString();
    const updated = { ...(rows[idx] as any), ...patch, id, dateModified: now } as T;
    rows[idx] = updated;
    await this.saveAll(collection, rows);
    return updated;
  }

  async remove(collection: string, id: string): Promise<boolean> {
    const rows = await this.all(collection);
    const next = rows.filter((r: any) => r.id !== id);
    await this.saveAll(collection, next);
    return next.length !== rows.length;
  }
}
