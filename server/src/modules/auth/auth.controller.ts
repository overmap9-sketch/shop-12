import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { JwtGuard } from './guards.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly svc: AuthService) {}

  @Post('login')
  login(@Body() body: any) { return this.svc.login(body.email, body.password); }

  @Post('register')
  register(@Body() body: any) { return this.svc.register(body); }

  @UseGuards(JwtGuard)
  @Get('me')
  me(@Req() req: any) { return this.svc.me(req.user); }

  @Get('health')
  health() { return { ok: true }; }
}
