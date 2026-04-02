import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ServiceLeadsController } from './service-leads.controller';
import { ServiceLeadsService } from './service-leads.service';

@Module({
  imports: [AuthModule],
  controllers: [ServiceLeadsController],
  providers: [ServiceLeadsService],
})
export class ServiceLeadsModule {}
