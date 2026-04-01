import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { InternalAuthService } from './internal-auth.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, InternalAuthService],
  exports: [AuthService, InternalAuthService],
})
export class AuthModule {}
