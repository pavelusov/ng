import type { Prisma } from "@/app/generated/prisma/client";
import type { ServiceDto, ServiceCreateDto, ServicePatchDto } from "@/entities/service/dto/service.dto";
import { serviceDbRowToDtoPlain } from "@/entities/service/dto/service.dto";
import prisma from "@/lib/prisma";

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

type ServiceDbRow = Prisma.ServiceGetPayload<{ select: typeof serviceSelect }>;

export const serviceRepository = {
  getServices: async (): Promise<ServiceDto[]> => {
    const rows: ServiceDbRow[] = await prisma.service.findMany({
      select: serviceSelect,
      orderBy: [{ category: "asc" }, { title: "asc" }],
    });
    return rows.map((row) => serviceDbRowToDtoPlain(row));
  },
  getServiceById: async (id: string): Promise<ServiceDto | null> => {
    const row = await prisma.service.findUnique({
      where: { id },
      select: serviceSelect,
    });
    return row ? serviceDbRowToDtoPlain(row as ServiceDbRow) : null;
  },
  createService: async (service: ServiceCreateDto): Promise<ServiceDto> => {
    const row = await prisma.service.create({
      data: service,
      select: serviceSelect,
    });
    return serviceDbRowToDtoPlain(row as ServiceDbRow);
  },
  updateService: async (
    id: string,
    service: ServicePatchDto
  ): Promise<ServiceDto> => {
    const row = await prisma.service.update({
      where: { id },
      data: service,
      select: serviceSelect,
    });
    return serviceDbRowToDtoPlain(row as ServiceDbRow);
  },
  deleteService: async (id: string): Promise<ServiceDto> => {
    const row = await prisma.service.delete({
      where: { id },
      select: serviceSelect,
    });
    return serviceDbRowToDtoPlain(row as ServiceDbRow);
  },
};