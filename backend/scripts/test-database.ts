import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function testDatabase() {
  console.log('Testing Prisma Postgres connection...\n');

  try {
    console.log('Connected to database!');

    const demoEmail = 'demo@example.com';
    const user = await prisma.user.upsert({
      where: { email: demoEmail },
      update: { name: 'Demo User' },
      create: { email: demoEmail, name: 'Demo User' },
    });
    console.log('Upserted user:', user);

    const allUsers = await prisma.user.findMany();
    console.log(`Found ${allUsers.length} user(s):`);
    allUsers.forEach((record) => {
      console.log(`- ${record.name ?? 'No name'} (${record.email})`);
    });
  } catch (error) {
    console.error('Error:', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

void testDatabase();
