import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JsonDbService, BaseEntity } from '../../persistence/json-db.service.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

interface User extends BaseEntity { email: string; passwordHash: string; firstName: string; lastName: string; role?: string; preferences?: any; addresses?: any[]; isEmailVerified?: boolean; isPhoneVerified?: boolean; lastLogin?: string; }

@Injectable()
export class AuthService {
  private readonly collection = 'users';
  constructor(private readonly db: JsonDbService, private readonly cfg: ConfigService) {}

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
    const token = this.signToken({ sub: u.id, email: u.email, role: u.role || 'user' });
    const { passwordHash, ...safe } = u as any;
    await this.db.update<User>(this.collection, u.id, { lastLogin: new Date().toISOString() } as any);
    return { user: safe, token, refreshToken: 'N/A', expiresIn: 3600 };
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
    const token = this.signToken({ sub: created.id, email: created.email, role: created.role });
    return { user: safe, token, refreshToken: 'N/A', expiresIn: 3600 };
  }
}
