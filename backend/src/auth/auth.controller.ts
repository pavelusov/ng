import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { InternalAuthService } from './internal-auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly internalAuthService: InternalAuthService,
  ) {}

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.validateCredentials(body.email, body.password);
  }

  @Post('signup')
  signup(@Body() body: SignupDto) {
    return this.authService.signup(body);
  }

  @Get('context')
  async getContext(@Req() request: Request) {
    const userId = this.internalAuthService.getUserIdFromRequest(request);
    return this.authService.getUserAuthContext(userId);
  }
}
