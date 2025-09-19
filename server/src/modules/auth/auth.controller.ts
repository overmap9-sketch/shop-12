import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { AuthService } from './auth.service.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly svc: AuthService) {}

  @Post('login')
  login(@Body() body: any) { return this.svc.login(body.email, body.password); }

  @Post('register')
  register(@Body() body: any) { return this.svc.register(body); }

  @Get('health')
  health() { return { ok: true }; }
}
