import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { ServiceCreateDto, ServicePatchDto } from './dto/service.dto';
import { ServicesService } from './services.service';

@Controller()
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get('services')
  getPublicServices() {
    return this.servicesService.getServices();
  }

  @Get('services/:id')
  async getPublicServiceById(@Param('id') id: string) {
    const service = await this.servicesService.getServiceById(id);
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    return service;
  }

  @Get('admin/services')
  async getAdminServices(@Req() request: Request) {
    const context = await this.servicesService.getManagementContext(request, 'read');
    return this.servicesService.getServices(
      context.isPlatformAdmin ? undefined : { providerId: context.providerId },
    );
  }

  @Get('admin/services/:id')
  async getAdminServiceById(@Req() request: Request, @Param('id') id: string) {
    const context = await this.servicesService.getManagementContext(request, 'read');
    const service = await this.servicesService.getServiceById(id, {
      providerId: context.isPlatformAdmin ? undefined : context.providerId,
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return service;
  }

  @Post('admin/services')
  async createService(@Req() request: Request, @Body() body: ServiceCreateDto) {
    const context = await this.servicesService.getManagementContext(request, 'create');

    if (!context.providerId) {
      throw new NotFoundException('Active provider is required to create services');
    }

    return this.servicesService.createService(body, {
      providerId: context.providerId,
      actorUserId: context.actorUserId,
    });
  }

  @Patch('admin/services/:id')
  async updateService(
    @Req() request: Request,
    @Param('id') id: string,
    @Body() body: ServicePatchDto,
  ) {
    const context = await this.servicesService.getManagementContext(request, 'update');

    return this.servicesService.updateService(id, body, {
      providerId: context.isPlatformAdmin ? undefined : context.providerId,
      actorUserId: context.actorUserId,
      canPublish: context.canPublish,
      canArchive: context.canArchive,
    });
  }

  @Delete('admin/services/:id')
  async deleteService(@Req() request: Request, @Param('id') id: string) {
    const context = await this.servicesService.getManagementContext(request, 'delete');

    await this.servicesService.deleteService(id, {
      providerId: context.isPlatformAdmin ? undefined : context.providerId,
    });

    return { ok: true };
  }
}
