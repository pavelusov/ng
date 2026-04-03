import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UnprocessableEntityException,
} from '@nestjs/common';
import type { Request } from 'express';
import { ServiceLeadsService } from './service-leads.service';

@Controller()
export class ServiceLeadsController {
  constructor(private readonly serviceLeadsService: ServiceLeadsService) {}

  @Post('services/:id/leads')
  async createPublicServiceLead(
    @Req() request: Request,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    const { data, issues } = this.serviceLeadsService.parseCreateDto(body);

    if (!data) {
      throw new UnprocessableEntityException({ error: 'Validation failed', issues });
    }

    const actorUserId = this.serviceLeadsService.getOptionalActorUserId(request);
    return this.serviceLeadsService.createPublicServiceLead(id, data, actorUserId);
  }

  @Get('service-leads/mine')
  async getCustomerServiceLeads(@Req() request: Request) {
    const actorUserId = this.serviceLeadsService.getRequiredActorUserId(request);
    return this.serviceLeadsService.getCustomerServiceLeads(actorUserId);
  }

  @Get('service-leads/mine/:id')
  async getCustomerServiceLeadById(@Req() request: Request, @Param('id') id: string) {
    const actorUserId = this.serviceLeadsService.getRequiredActorUserId(request);
    return this.serviceLeadsService.getCustomerServiceLeadById(actorUserId, id);
  }

  @Get('pro/service-leads')
  async getProServiceLeads(@Req() request: Request) {
    const context = await this.serviceLeadsService.getManagementContext(request, 'read');
    if (context.isPlatformAdmin) {
      throw new ForbiddenException('Forbidden');
    }
    return this.serviceLeadsService.getServiceLeads(
      { providerId: context.providerId },
    );
  }

  @Get('pro/service-leads/:id')
  async getProServiceLeadById(@Req() request: Request, @Param('id') id: string) {
    const context = await this.serviceLeadsService.getManagementContext(request, 'read');
    const lead = await this.serviceLeadsService.getServiceLeadById(id, {
      providerId: context.providerId,
    });

    if (!lead) {
      throw new NotFoundException('Service lead not found');
    }

    return lead;
  }

  @Patch('pro/service-leads/:id')
  async updateProServiceLead(
    @Req() request: Request,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    const context = await this.serviceLeadsService.getManagementContext(request, 'update');
    if (context.isPlatformAdmin) {
      throw new ForbiddenException('Forbidden');
    }
    const { data, issues } = this.serviceLeadsService.parsePatchDto(body);

    if (!data) {
      throw new UnprocessableEntityException({ error: 'Validation failed', issues });
    }

    return this.serviceLeadsService.updateServiceLead(id, data, {
      providerId: context.providerId,
    });
  }

  @Get('admin/service-leads')
  async getAdminServiceLeads(@Req() request: Request) {
    const context = await this.serviceLeadsService.getManagementContext(request, 'read');
    if (!context.isPlatformAdmin) {
      throw new ForbiddenException('Forbidden');
    }
    return this.serviceLeadsService.getServiceLeads();
  }

  @Get('admin/service-leads/:id')
  async getAdminServiceLeadById(@Req() request: Request, @Param('id') id: string) {
    const context = await this.serviceLeadsService.getManagementContext(request, 'read');
    if (!context.isPlatformAdmin) {
      throw new ForbiddenException('Forbidden');
    }
    const lead = await this.serviceLeadsService.getServiceLeadById(id);

    if (!lead) {
      throw new NotFoundException('Service lead not found');
    }

    return lead;
  }

  @Patch('admin/service-leads/:id')
  async updateAdminServiceLead(@Req() request: Request, @Param('id') id: string, @Body() body: unknown) {
    const context = await this.serviceLeadsService.getManagementContext(request, 'update');
    if (!context.isPlatformAdmin) {
      throw new ForbiddenException('Forbidden');
    }
    const { data, issues } = this.serviceLeadsService.parsePatchDto(body);

    if (!data) {
      throw new UnprocessableEntityException({ error: 'Validation failed', issues });
    }

    return this.serviceLeadsService.updateServiceLead(id, data);
  }
}
