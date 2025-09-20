import { Injectable, Inject } from '@nestjs/common';
import { DATA_STORE, DataStore } from '../../persistence/data-store.js';

export interface Category { id: string; slug: string; name: string; description?: string; image?: string; parentId?: string; productCount: number; isActive: boolean; sortOrder: number; }

@Injectable()
export class CategoriesService {
  private readonly collection = 'categories';
  constructor(@Inject(DATA_STORE) private readonly db: DataStore) {}

  async list(query: any) {
    const rows = await this.db.all<Category>(this.collection);
    let list = [...rows];
    if (query.parentId !== undefined) list = list.filter(c => String(c.parentId||'') === String(query.parentId));
    if (query.isActive !== undefined) list = list.filter(c => String(c.isActive) === String(query.isActive));
    return list.sort((a,b)=>a.sortOrder-b.sortOrder);
  }

  async tree() {
    const list = await this.db.all<Category>(this.collection);
    const byParent = (pid?: string) => list.filter(c=>c.parentId===pid).sort((a,b)=>a.sortOrder-b.sortOrder);
    const build = (pid?: string): any[] => byParent(pid).map(c => ({...c, children: build(c.id)}));
    return build(undefined);
  }

  get = (id: string) => this.db.findById<Category>(this.collection, id);
  create = (data: Omit<Category,'id'|'productCount'>) => this.db.insert<Category>(this.collection, { ...data, productCount: 0 } as any);
  update = (id: string, patch: Partial<Category>) => this.db.update<Category>(this.collection, id, patch);
  remove = (id: string) => this.db.remove(this.collection, id);
}
