import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { SERVICES_SEED } from './seed-data/services';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function seedServices() {
  console.log('Seeding services...\n');

  try {
    const defaultProvider = await prisma.provider.upsert({
      where: { slug: 'platform-services' },
      update: {
        name: 'Platform Services',
        type: 'COMPANY',
      },
      create: {
        name: 'Platform Services',
        slug: 'platform-services',
        type: 'COMPANY',
      },
      select: { id: true },
    });

    await prisma.service.deleteMany();

    for (const service of SERVICES_SEED) {
      await prisma.service.create({
        data: {
          ...service,
          providerId: defaultProvider.id,
        },
      });
    }

    console.log(`Done. Inserted ${SERVICES_SEED.length} service(s).\n`);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

void seedServices();
