import {
  BadRequestException,
  ConflictException,
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
  parseServiceLeadCreateDto,
  parseServiceLeadPatchDto,
  serviceLeadDbRowToDtoPlain,
  type ServiceLeadCreateDto,
  type ServiceLeadDbRow,
  type ServiceLeadDto,
  type ServiceLeadPatchDto,
  type ServiceLeadStatus,
} from './dto/service-lead.dto';
import type { ServiceLeadManagementAction } from '../auth/authorization';

const serviceLeadSelect = {
  id: true,
  serviceId: true,
  providerId: true,
  status: true,
  customerUserId: true,
  customerName: true,
  customerEmail: true,
  customerPhone: true,
  message: true,
  createdAt: true,
  updatedAt: true,
  service: {
    select: {
      title: true,
    },
  },
} satisfies Prisma.ServiceLeadSelect;

type ServiceLeadScope = {
  providerId?: string | null;
};

function canTransitionLeadStatus(currentStatus: ServiceLeadStatus, nextStatus: ServiceLeadStatus) {
  if (currentStatus === nextStatus) {
    return true;
  }

  if (currentStatus === 'NEW') {
    return nextStatus === 'IN_PROGRESS' || nextStatus === 'CLOSED';
  }

  if (currentStatus === 'IN_PROGRESS') {
    return nextStatus === 'CONVERTED_TO_ORDER' || nextStatus === 'CLOSED';
  }

  return false;
}

@Injectable()
export class ServiceLeadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly internalAuthService: InternalAuthService,
  ) {}

  private async resolveLeadCustomer(actorUserId?: string | null) {
    if (!actorUserId) {
      return null;
    }

    return this.prisma.user.findUnique({
      where: { id: actorUserId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }

  private async getScopedLeadRowWithClient(
    client: Prisma.TransactionClient | PrismaService,
    id: string,
    providerId?: string | null,
  ) {
    const row = await client.serviceLead.findFirst({
      where: providerId ? { id, providerId } : { id },
      select: serviceLeadSelect,
    });

    if (!row) {
      throw new NotFoundException('Service lead not found');
    }

    return row as ServiceLeadDbRow;
  }

  private async getScopedLeadRow(id: string, providerId?: string | null) {
    return this.getScopedLeadRowWithClient(this.prisma, id, providerId);
  }

  async getServiceLeads(scope?: ServiceLeadScope): Promise<ServiceLeadDto[]> {
    const rows = await this.prisma.serviceLead.findMany({
      where: scope?.providerId ? { providerId: scope.providerId } : undefined,
      select: serviceLeadSelect,
      orderBy: [{ createdAt: 'desc' }],
    });

    return rows.map((row) => serviceLeadDbRowToDtoPlain(row as ServiceLeadDbRow));
  }

  async getCustomerServiceLeads(customerUserId: string): Promise<ServiceLeadDto[]> {
    const rows = await this.prisma.serviceLead.findMany({
      where: {
        customerUserId,
      },
      select: serviceLeadSelect,
      orderBy: [{ createdAt: 'desc' }],
    });

    return rows.map((row) => serviceLeadDbRowToDtoPlain(row as ServiceLeadDbRow));
  }

  async getCustomerServiceLeadById(customerUserId: string, id: string): Promise<ServiceLeadDto> {
    const row = await this.prisma.serviceLead.findFirst({
      where: { id, customerUserId },
      select: serviceLeadSelect,
    });
    if (!row) {
      throw new NotFoundException('Service lead not found');
    }
    return serviceLeadDbRowToDtoPlain(row as ServiceLeadDbRow);
  }

  async getServiceLeadById(id: string, scope?: ServiceLeadScope): Promise<ServiceLeadDto> {
    const row = await this.getScopedLeadRow(id, scope?.providerId);
    return serviceLeadDbRowToDtoPlain(row);
  }

  async createPublicServiceLead(
    serviceId: string,
    input: ServiceLeadCreateDto,
    actorUserId?: string | null,
  ): Promise<ServiceLeadDto> {
    const service = await this.prisma.service.findFirst({
      where: {
        id: serviceId,
        status: 'PUBLISHED',
      },
      select: {
        id: true,
        providerId: true,
      },
    });

    if (!service) {
      throw new NotFoundException('Published service not found');
    }

    const actor = await this.resolveLeadCustomer(actorUserId);

    const customerName = input.customerName ?? actor?.name ?? null;
    const customerEmail = input.customerEmail ?? actor?.email ?? null;
    const customerPhone = input.customerPhone ?? null;
    const message = input.message ?? null;

    if (!customerEmail && !customerPhone) {
      throw new BadRequestException('Customer email or phone is required');
    }

    const created = await this.prisma.serviceLead.create({
      data: {
        serviceId: service.id,
        providerId: service.providerId,
        customerUserId: actor?.id ?? null,
        customerName,
        customerEmail,
        customerPhone,
        message,
        status: 'NEW',
      },
      select: serviceLeadSelect,
    });

    return serviceLeadDbRowToDtoPlain(created as ServiceLeadDbRow);
  }

  async updateServiceLead(id: string, patch: ServiceLeadPatchDto, scope?: ServiceLeadScope): Promise<ServiceLeadDto> {
    if (!patch.status) {
      throw new BadRequestException('Lead status is required');
    }

    const current = await this.getScopedLeadRow(id, scope?.providerId);

    if (!canTransitionLeadStatus(current.status, patch.status)) {
      throw new ForbiddenException('This lead status transition is not allowed');
    }

    if (patch.status === 'CONVERTED_TO_ORDER' && current.status !== 'CONVERTED_TO_ORDER') {
      const updated = await this.prisma.$transaction(async (tx) => {
        const scopedLead = await this.getScopedLeadRowWithClient(tx, id, scope?.providerId);

        if (!canTransitionLeadStatus(scopedLead.status, patch.status!)) {
          throw new ForbiddenException('This lead status transition is not allowed');
        }

        if (!scopedLead.customerUserId) {
          throw new ConflictException('Cannot convert lead without customer account');
        }

        const existingOrder = await tx.order.findUnique({
          where: { serviceLeadId: scopedLead.id },
          select: { id: true },
        });

        if (existingOrder) {
          throw new ConflictException('Order already exists for this lead');
        }

        await tx.order.create({
          data: {
            serviceLeadId: scopedLead.id,
            serviceId: scopedLead.serviceId,
            providerId: scopedLead.providerId,
            customerUserId: scopedLead.customerUserId,
            status: 'ACTIVE',
          },
        });

        return tx.serviceLead.update({
          where: { id: scopedLead.id },
          data: { status: patch.status },
          select: serviceLeadSelect,
        });
      });

      return serviceLeadDbRowToDtoPlain(updated as ServiceLeadDbRow);
    }

    const updated = await this.prisma.serviceLead.update({
      where: { id: current.id },
      data: { status: patch.status },
      select: serviceLeadSelect,
    });

    return serviceLeadDbRowToDtoPlain(updated as ServiceLeadDbRow);
  }

  parsePatchDto(body: unknown) {
    return parseServiceLeadPatchDto(body);
  }

  parseCreateDto(body: unknown) {
    return parseServiceLeadCreateDto(body);
  }

  async getManagementContext(request: Request, action: ServiceLeadManagementAction) {
    const userId = this.internalAuthService.getUserIdFromRequest(request);
    try {
      return await this.authService.getServiceLeadManagementContext(userId, action);
    } catch (error) {
      if (error instanceof UnauthorizedException || error instanceof ForbiddenException) {
        throw error;
      }
      throw error;
    }
  }

  getOptionalActorUserId(request: Request) {
    return this.internalAuthService.getOptionalUserIdFromRequest(request);
  }

  getRequiredActorUserId(request: Request) {
    return this.internalAuthService.getUserIdFromRequest(request);
  }
}
