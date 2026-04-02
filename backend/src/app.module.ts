import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { OrdersModule } from './orders/orders.module';
import { ServicesModule } from './services/services.module';
import { ServiceLeadsModule } from './service-leads/service-leads.module';
import { UsersModule } from './users/users.module';
import { ProvidersModule } from './providers/providers.module';

@Module({
  imports: [PrismaModule, AuthModule, ServicesModule, ServiceLeadsModule, OrdersModule, UsersModule, ProvidersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
