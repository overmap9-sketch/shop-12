import { Injectable, Inject } from '@nestjs/common';
import { DATA_STORE, DataStore } from '../../persistence/data-store.js';

interface Order { id: string; userId: string; items: any[]; total: number; status: string; createdAt: string }

@Injectable()
export class OrdersService {
  private readonly collection = 'orders';
  constructor(@Inject(DATA_STORE) private readonly db: DataStore) {}

  async create(userId: string, payload: any) {
    const order: Partial<Order> = { userId, items: payload.items||[], total: payload.total||0, status: 'created', createdAt: new Date().toISOString() };
    return this.db.insert<Order>(this.collection, order as any);
  }

  async list(userId?: string) {
    const all = await this.db.all<Order>(this.collection);
    if (!userId) return all;
    return all.filter(o => o.userId === userId);
  }

  async findBySession(sessionId: string) {
    const all = await this.db.all<any>(this.collection);
    return all.find((o) => o.sessionId === sessionId);
  }

  async findById(id: string) {
    return this.db.findById<any>(this.collection, id);
  }

  async update(id: string, patch: Partial<any>) {
    return this.db.update<any>(this.collection, id, patch as any);
  }
}
