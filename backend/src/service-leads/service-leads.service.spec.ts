import { ConflictException } from '@nestjs/common';
import { ServiceLeadsService } from './service-leads.service';

function buildLead(status: 'IN_PROGRESS' | 'CONVERTED_TO_ORDER', customerUserId: string | null = 'customer-1') {
  return {
    id: 'lead-1',
    serviceId: 'service-1',
    providerId: 'provider-1',
    status,
    customerUserId,
    customerName: 'Jane Doe',
    customerEmail: 'jane@example.com',
    customerPhone: '+79990000000',
    message: 'Need help',
    service: {
      title: 'Межевание участка',
    },
    createdAt: new Date('2026-04-02T10:00:00.000Z'),
    updatedAt: new Date('2026-04-02T10:00:00.000Z'),
  };
}

describe('ServiceLeadsService', () => {
  it('creates an order when converting lead to order', async () => {
    const currentLead = buildLead('IN_PROGRESS');
    const updatedLead = buildLead('CONVERTED_TO_ORDER');

    const tx = {
      serviceLead: {
        findFirst: jest.fn().mockResolvedValue(currentLead),
        update: jest.fn().mockResolvedValue(updatedLead),
      },
      order: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ id: 'order-1' }),
      },
    };

    const prisma = {
      serviceLead: {
        findFirst: jest.fn().mockResolvedValue(currentLead),
        update: jest.fn(),
      },
      $transaction: jest.fn(async (callback: (client: typeof tx) => unknown) => callback(tx)),
    };

    const service = new ServiceLeadsService(prisma as never, {} as never, {} as never);

    const result = await service.updateServiceLead(
      'lead-1',
      { status: 'CONVERTED_TO_ORDER' },
      { providerId: 'provider-1' },
    );

    expect(prisma.$transaction).toHaveBeenCalled();
    expect(tx.order.findUnique).toHaveBeenCalledWith({
      where: { serviceLeadId: 'lead-1' },
      select: { id: true },
    });
    expect(tx.order.create).toHaveBeenCalledWith({
      data: {
        serviceLeadId: 'lead-1',
        serviceId: 'service-1',
        providerId: 'provider-1',
        customerUserId: 'customer-1',
        status: 'ACTIVE',
      },
    });
    expect(result.status).toBe('CONVERTED_TO_ORDER');
  });

  it('does not create a duplicate order for the same lead', async () => {
    const currentLead = buildLead('IN_PROGRESS');

    const tx = {
      serviceLead: {
        findFirst: jest.fn().mockResolvedValue(currentLead),
        update: jest.fn(),
      },
      order: {
        findUnique: jest.fn().mockResolvedValue({ id: 'order-1' }),
        create: jest.fn(),
      },
    };

    const prisma = {
      serviceLead: {
        findFirst: jest.fn().mockResolvedValue(currentLead),
        update: jest.fn(),
      },
      $transaction: jest.fn(async (callback: (client: typeof tx) => unknown) => callback(tx)),
    };

    const service = new ServiceLeadsService(prisma as never, {} as never, {} as never);

    await expect(
      service.updateServiceLead(
        'lead-1',
        { status: 'CONVERTED_TO_ORDER' },
        { providerId: 'provider-1' },
      ),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(tx.order.create).not.toHaveBeenCalled();
  });
});
