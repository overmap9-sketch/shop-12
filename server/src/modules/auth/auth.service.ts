import { Injectable, UnauthorizedException, ConflictException, OnModuleInit, Logger } from '@nestjs/common';
import { JsonDbService, BaseEntity } from '../../persistence/json-db.service.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

interface User extends BaseEntity { email: string; passwordHash: string; firstName: string; lastName: string; role?: string; permissions?: string[]; preferences?: any; addresses?: any[]; isEmailVerified?: boolean; isPhoneVerified?: boolean; lastLogin?: string; }

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly collection = 'users';
  private readonly logger = new Logger(AuthService.name);
  constructor(private readonly db: JsonDbService, private readonly cfg: ConfigService) {}

  async onModuleInit() {
    // Seed default admin if none exists
    const users = await this.db.all<User>(this.collection);
    const hasAny = users.length > 0;
    if (!hasAny) {
      const email = this.cfg.get<string>('ADMIN_EMAIL') || 'admin@example.com';
      const password = this.cfg.get<string>('ADMIN_PASSWORD') || 'admin123';
      const passwordHash = await bcrypt.hash(password, 10);
      const admin: Partial<User> = {
        email,
        passwordHash,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        permissions: ['admin.access','files:upload','products:create','products:update','products:delete','categories:create','categories:update','categories:delete'],
        preferences: { language: 'en', currency: 'USD', theme: 'default', emailNotifications: true, smsNotifications: false, marketingEmails: false },
        addresses: [],
        isEmailVerified: true,
        isPhoneVerified: false,
      };
      await this.db.insert<User>(this.collection, admin as any);
      this.logger.log(`Seeded default admin user: ${email}`);
    }
  }

  private signToken(payload: any) {
    const secret = this.cfg.get<string>('JWT_SECRET') || 'dev';
    const expiresIn = this.cfg.get<string>('JWT_EXPIRES_IN') || '3600';
    return jwt.sign(payload, secret, { expiresIn: Number(expiresIn) });
  }

  async login(email: string, password: string) {
    const users = await this.db.all<User>(this.collection);
    const u = users.find(x => x.email.toLowerCase() === email.toLowerCase());
    if (!u) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(password, u.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    const token = this.signToken({ sub: u.id, email: u.email, role: u.role || 'user', permissions: u.permissions || [] });
    const { passwordHash, ...safe } = u as any;
    await this.db.update<User>(this.collection, u.id, { lastLogin: new Date().toISOString() } as any);
    return { user: safe, token, refreshToken: 'N/A', expiresIn: Number(this.cfg.get<string>('JWT_EXPIRES_IN') || '3600') };
  }

  async register(data: { email: string; password: string; firstName: string; lastName: string; phone?: string; }) {
    const users = await this.db.all<User>(this.collection);
    if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) throw new ConflictException('Email already registered');
    const passwordHash = await bcrypt.hash(data.password, 10);
    const user: Partial<User> = {
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      role: 'user',
      preferences: { language: 'en', currency: 'USD', theme: 'default', emailNotifications: true, smsNotifications: false, marketingEmails: false },
      addresses: [],
      isEmailVerified: false,
      isPhoneVerified: false,
    };
    const created = await this.db.insert<User>(this.collection, user as any);
    const { passwordHash: _, ...safe } = created as any;
    const token = this.signToken({ sub: created.id, email: created.email, role: created.role, permissions: [] });
    return { user: safe, token, refreshToken: 'N/A', expiresIn: Number(this.cfg.get<string>('JWT_EXPIRES_IN') || '3600') };
  }

  async me(user: any) {
    const found = await this.db.findById<User>(this.collection, user?.id || user?.sub);
    if (!found) throw new UnauthorizedException();
    const { passwordHash, ...safe } = found as any;
    return { user: safe };
  }
}
