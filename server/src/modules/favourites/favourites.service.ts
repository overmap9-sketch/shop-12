import { Injectable } from '@nestjs/common';
import { JsonDbService } from '../../persistence/json-db.service.js';
import type { Product } from '../products/products.service.js';

interface Favourite { id: string; userId: string; productId: string; product: Product; dateAdded: string }

@Injectable()
export class FavouritesService {
  private readonly collection = 'favourites';
  constructor(private readonly db: JsonDbService) {}

  async list(userId = 'guest') { return (await this.db.all<Favourite>(this.collection)).filter(f => f.userId === userId); }

  async add(userId: string, product: Product) {
    const favs = await this.db.all<Favourite>(this.collection);
    if (favs.some(f => f.userId === userId && f.productId === product.id)) return this.list(userId);
    await this.db.insert<Favourite>(this.collection, { id: undefined as any, userId, productId: product.id, product, dateAdded: new Date().toISOString() } as any);
    return this.list(userId);
  }

  async remove(userId: string, productId: string) {
    const favs = await this.db.all<Favourite>(this.collection);
    const target = favs.find(f => f.userId === userId && f.productId === productId);
    if (target) await this.db.remove(this.collection, target.id);
    return this.list(userId);
  }

  async clear(userId: string) {
    const favs = await this.db.all<Favourite>(this.collection);
    const rest = favs.filter(f => f.userId !== userId);
    await this.db.saveAll(this.collection, rest);
    return [];
  }
}
