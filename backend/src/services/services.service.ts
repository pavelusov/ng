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
  type ServiceCreateDto,
  type ServiceDbRow,
  type ServiceDto,
  type ServicePatchDto,
  serviceDbRowToDtoPlain,
} from './dto/service.dto';
import type { ServiceManagementAction } from '../auth/authorization';

const serviceSelect = {
  id: true,
  category: true,
  title: true,
  image: true,
  stockBadge: true,
  price: true,
  rating: true,
  reviewCount: true,
  ctaText: true,
  ctaHref: true,
  description: true,
  highlight: true,
  badge: true,
  paletteColor: true,
  icon: true,
} satisfies Prisma.ServiceSelect;

type ServiceScope = {
  providerId?: string | null;
  actorUserId?: string;
};

@Injectable()
export class ServicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly internalAuthService: InternalAuthService,
  ) {}

  private async resolveScopedServiceId(id: string, providerId?: string | null) {
    if (!providerId) {
      return id;
    }

    const row = await this.prisma.service.findFirst({
      where: {
        id,
        providerId,
      },
      select: { id: true },
    });

    if (!row) {
      throw new NotFoundException('Service not found');
    }

    return row.id;
  }

  async getServices(scope?: Pick<ServiceScope, 'providerId'>): Promise<ServiceDto[]> {
    const rows: ServiceDbRow[] = await this.prisma.service.findMany({
      where: scope?.providerId ? { providerId: scope.providerId } : undefined,
      select: serviceSelect,
      orderBy: [{ category: 'asc' }, { title: 'asc' }],
    });

    return rows.map((row) => serviceDbRowToDtoPlain(row));
  }

  async getServiceById(id: string, scope?: Pick<ServiceScope, 'providerId'>): Promise<ServiceDto | null> {
    const row = scope?.providerId
      ? await this.prisma.service.findFirst({
          where: { id, providerId: scope.providerId },
          select: serviceSelect,
        })
      : await this.prisma.service.findUnique({
          where: { id },
          select: serviceSelect,
        });

    return row ? serviceDbRowToDtoPlain(row as ServiceDbRow) : null;
  }

  async createService(
    service: ServiceCreateDto,
    scope: { providerId: string; actorUserId?: string },
  ): Promise<ServiceDto> {
    const row = await this.prisma.service.create({
      data: {
        ...service,
        providerId: scope.providerId,
        createdByUserId: scope.actorUserId,
        updatedByUserId: scope.actorUserId,
      },
      select: serviceSelect,
    });

    return serviceDbRowToDtoPlain(row as ServiceDbRow);
  }

  async updateService(id: string, service: ServicePatchDto, scope?: ServiceScope): Promise<ServiceDto> {
    const serviceId = await this.resolveScopedServiceId(id, scope?.providerId);

    const row = await this.prisma.service.update({
      where: { id: serviceId },
      data: {
        ...service,
        updatedByUserId: scope?.actorUserId,
      },
      select: serviceSelect,
    });

    return serviceDbRowToDtoPlain(row as ServiceDbRow);
  }

  async deleteService(id: string, scope?: Pick<ServiceScope, 'providerId'>) {
    const serviceId = await this.resolveScopedServiceId(id, scope?.providerId);

    await this.prisma.service.delete({
      where: { id: serviceId },
    });
  }

  async getManagementContext(request: Request, action: ServiceManagementAction) {
    const userId = this.internalAuthService.getUserIdFromRequest(request);
    try {
      return await this.authService.getServiceManagementContext(userId, action);
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof ForbiddenException) {
        throw error;
      }
      throw error;
    }
  }
}
