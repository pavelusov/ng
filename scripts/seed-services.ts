import "dotenv/config";
import prisma from "../lib/prisma";
import { SERVICES_SEED } from "./seed-data/services";

async function seedServices() {
  console.log("Seeding services...\n");

  try {
    const services = SERVICES_SEED;

    await prisma.service.deleteMany();
    for (const service of services) {
      await prisma.service.create({ data: service });
    }

    console.log(`Done. Inserted ${services.length} service(s).\n`);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedServices();
