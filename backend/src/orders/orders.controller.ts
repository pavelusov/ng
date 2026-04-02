import { Controller, Get, Req } from '@nestjs/common';
import type { Request } from 'express';
import { OrdersService } from './orders.service';

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('orders/mine')
  async getCustomerOrders(@Req() request: Request) {
    const actorUserId = this.ordersService.getRequiredActorUserId(request);
    return this.ordersService.getCustomerOrders(actorUserId);
  }

  @Get('admin/orders')
  async getAdminOrders(@Req() request: Request) {
    const context = await this.ordersService.getManagementContext(request, 'read');
    return this.ordersService.getOrders(
      context.isPlatformAdmin ? undefined : { providerId: context.providerId },
    );
  }
}
