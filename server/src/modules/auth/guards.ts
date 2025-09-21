import { CanActivate, ExecutionContext, Injectable, SetMetadata, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';

export const PERMISSIONS_KEY = 'permissions_required';
export const Permissions = (...perms: string[]) => SetMetadata(PERMISSIONS_KEY, perms);

export interface RequestUser { id: string; email: string; role?: string; permissions?: string[] }

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly cfg: ConfigService) {}
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<any>();
    const auth = req.headers['authorization'] || req.headers['Authorization'];
    if (!auth || typeof auth !== 'string' || !auth.startsWith('Bearer ')) throw new UnauthorizedException('Missing token');
    let token = auth.slice('Bearer '.length).trim();
    token = token.replace(/^"+|"+$/g, '');

    // Optional dev-mode: accept mock tokens
    const allowMock = (this.cfg.get<string>('ALLOW_MOCK_TOKENS') || '').toLowerCase() === 'true';
    if (allowMock && token.startsWith('mock_')) {
      req.user = { id: 'mock', email: 'mock@local', role: 'admin', permissions: ['files:upload'] } as RequestUser;
      return true;
    }

    try {
      const secret = this.cfg.get<string>('JWT_SECRET') || 'dev';
      const payload: any = jwt.verify(token, secret);
      req.user = { id: payload.sub, email: payload.email, role: payload.role, permissions: payload.permissions } as RequestUser;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) || [];
    if (required.length === 0) return true;
    const req = context.switchToHttp().getRequest<any>();
    const user: RequestUser | undefined = req.user;
    if (!user) throw new UnauthorizedException();
    if (user.role === 'admin') return true;
    const perms = new Set((user.permissions || []).map((p)=>p.toLowerCase()));
    const ok = required.every((p)=> perms.has(p.toLowerCase()));
    if (!ok) throw new ForbiddenException('Missing permission');
    return true;
  }
}
