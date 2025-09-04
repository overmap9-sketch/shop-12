import { useMemo } from 'react';
import { useAppSelector } from '../../app/hooks';
import { selectUser } from '../../features/auth/authSlice';
import type { User } from '../../entities';

export type Permission =
  | 'admin.access'
  | 'products.read'
  | 'products.create'
  | 'products.update'
  | 'products.delete'
  | 'products.bulkUpdate'
  | 'categories.read'
  | 'categories.create'
  | 'categories.update'
  | 'categories.delete'
  | 'orders.read'
  | 'orders.update'
  | 'users.read'
  | 'users.update'
  | 'users.delete'
  | 'settings.update'
  | 'coupons.read'
  | 'coupons.create'
  | 'coupons.update'
  | 'coupons.delete';

export type AdminRole = 'owner' | 'admin' | 'manager' | 'editor' | 'viewer' | 'user';

const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  owner: ['admin.access',
    'products.read','products.create','products.update','products.delete','products.bulkUpdate',
    'categories.read','categories.create','categories.update','categories.delete',
    'orders.read','orders.update',
    'users.read','users.update','users.delete',
    'settings.update',
    'coupons.read','coupons.create','coupons.update','coupons.delete'],
  admin: ['admin.access',
    'products.read','products.create','products.update','products.delete','products.bulkUpdate',
    'categories.read','categories.create','categories.update','categories.delete',
    'orders.read','orders.update',
    'users.read','users.update',
    'settings.update',
    'coupons.read','coupons.create','coupons.update','coupons.delete'],
  manager: ['admin.access',
    'products.read','products.create','products.update','products.bulkUpdate',
    'categories.read','categories.create','categories.update',
    'orders.read','orders.update',
    'users.read',
    'settings.update',
    'coupons.read','coupons.create','coupons.update'],
  editor: ['admin.access',
    'products.read','products.create','products.update',
    'categories.read','categories.update',
    'orders.read',
    'coupons.read','coupons.update'],
  viewer: ['admin.access', 'products.read','categories.read','orders.read','users.read','coupons.read'],
  user: [],
};

export function isAdminRole(role?: string | null): boolean {
  return !!role && role !== 'user';
}

export function getUserPermissions(user: User | null | undefined): Permission[] {
  if (!user) return [];
  const role = (user.role as AdminRole) || 'user';
  const base = ROLE_PERMISSIONS[role] || [];
  const custom = (user as any).permissions as Permission[] | undefined;
  return Array.from(new Set([...(custom || []), ...base]));
}

export function hasPermission(user: User | null | undefined, perm: Permission): boolean {
  if (!user) return false;
  if ((user.role as AdminRole) === 'owner') return true;
  return getUserPermissions(user).includes(perm);
}

export function useHasPermission(perm: Permission) {
  const user = useAppSelector(selectUser);
  return useMemo(() => hasPermission(user, perm), [user, perm]);
}

export function usePermissions() {
  const user = useAppSelector(selectUser);
  return useMemo(() => ({
    user,
    has: (perm: Permission) => hasPermission(user, perm),
    list: getUserPermissions(user),
    isAdminRole: isAdminRole(user?.role),
  }), [user]);
}
