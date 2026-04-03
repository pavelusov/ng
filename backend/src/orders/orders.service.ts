import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { InternalAuthService } from '../auth/internal-auth.service';
import {
  orderDbRowToDtoPlain,
  type OrderDbRow,
  type OrderDto,
} from './dto/order.dto';
import type { OrderManagementAction } from '../auth/authorization';

const orderSelect = {
  id: true,
  serviceLeadId: true,
  serviceId: true,
  providerId: true,
  customerUserId: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  service: {
    select: {
      title: true,
    },
  },
  provider: {
    select: {
      name: true,
    },
  },
  customerUser: {
    select: {
      name: true,
      email: true,
    },
  },
} satisfies Prisma.OrderSelect;

type OrderScope = {
  providerId?: string | null;
};

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly internalAuthService: InternalAuthService,
  ) {}

  async getCustomerOrders(customerUserId: string): Promise<OrderDto[]> {
    const rows = await this.prisma.order.findMany({
      where: { customerUserId },
      select: orderSelect,
      orderBy: [{ createdAt: 'desc' }],
    });

    return rows.map((row) => orderDbRowToDtoPlain(row as OrderDbRow));
  }

  async getCustomerOrderById(customerUserId: string, id: string): Promise<OrderDto> {
    const row = await this.prisma.order.findFirst({
      where: { id, customerUserId },
      select: orderSelect,
    });

    if (!row) {
      throw new NotFoundException('Order not found');
    }

    return orderDbRowToDtoPlain(row as OrderDbRow);
  }

  async getOrders(scope?: OrderScope): Promise<OrderDto[]> {
    const rows = await this.prisma.order.findMany({
      where: scope?.providerId ? { providerId: scope.providerId } : undefined,
      select: orderSelect,
      orderBy: [{ createdAt: 'desc' }],
    });

    return rows.map((row) => orderDbRowToDtoPlain(row as OrderDbRow));
  }

  async getOrderById(id: string, scope?: OrderScope): Promise<OrderDto> {
    const row = await this.prisma.order.findFirst({
      where: scope?.providerId ? { id, providerId: scope.providerId } : { id },
      select: orderSelect,
    });

    if (!row) {
      throw new NotFoundException('Order not found');
    }

    return orderDbRowToDtoPlain(row as OrderDbRow);
  }

  async getManagementContext(request: Request, action: OrderManagementAction) {
    const userId = this.internalAuthService.getUserIdFromRequest(request);
    try {
      return await this.authService.getOrderManagementContext(userId, action);
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof ForbiddenException) {
        throw error;
      }

      throw error;
    }
  }

  getRequiredActorUserId(request: Request) {
    return this.internalAuthService.getUserIdFromRequest(request);
  }
}
