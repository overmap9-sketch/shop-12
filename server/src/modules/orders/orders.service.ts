import { Injectable } from '@nestjs/common';
import { JsonDbService } from '../../persistence/json-db.service.js';

interface Order { id: string; userId: string; items: any[]; total: number; status: string; createdAt: string }

@Injectable()
export class OrdersService {
  private readonly collection = 'orders';
  constructor(private readonly db: JsonDbService) {}

  async create(userId: string, payload: any) {
    const order: Partial<Order> = { userId, items: payload.items||[], total: payload.total||0, status: 'created', createdAt: new Date().toISOString() };
    return this.db.insert<Order>(this.collection, order as any);
  }

  async list(userId: string) {
    const all = await this.db.all<Order>(this.collection);
    return all.filter(o => o.userId === userId);
  }
}
