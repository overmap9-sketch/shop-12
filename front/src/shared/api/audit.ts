import { Storage, STORAGE_KEYS } from '../lib/storage';
import type { User } from '../../entities';

export interface AuditLog {
  id: string;
  timestamp: string;
  userId?: string;
  userEmail?: string;
  action: string; // e.g., create|update|delete|bulkUpdate
  entity: string; // e.g., product, category, settings, coupon
  entityId?: string;
  before?: any;
  after?: any;
  metadata?: Record<string, any>;
}

const genId = () => `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

export class AuditAPI {
  static list(options: { limit?: number } = {}): AuditLog[] {
    const logs = Storage.get<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []) || [];
    const sorted = logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    if (options.limit) return sorted.slice(0, options.limit);
    return sorted;
  }

  static record(log: Omit<AuditLog, 'id' | 'timestamp' | 'userId' | 'userEmail'> & { user?: Pick<User, 'id' | 'email'> | null }): AuditLog {
    const now = new Date().toISOString();
    const existing = Storage.get<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []) || [];
    const currentUser = log.user ?? Storage.get<User>(STORAGE_KEYS.USER, null);
    const entry: AuditLog = {
      id: genId(),
      timestamp: now,
      userId: currentUser?.id,
      userEmail: currentUser?.email,
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      before: log.before,
      after: log.after,
      metadata: log.metadata,
    };
    Storage.set(STORAGE_KEYS.AUDIT_LOGS, [entry, ...existing].slice(0, 500));
    return entry;
  }
}
