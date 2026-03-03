import "dotenv/config";
import prisma from "../lib/prisma";

async function testDatabase() {
  console.log("Testing Prisma Postgres connection...\n");

  try {
    console.log("Connected to database!");

    console.log("\nCreating a test user...");
    const demoEmail = "demo@example.com";
    const user = await prisma.user.upsert({
      where: { email: demoEmail },
      update: { name: "Demo User" },
      create: { email: demoEmail, name: "Demo User" },
    });
    console.log("Upserted user:", user);

    console.log("\nFetching all users...");
    const allUsers = await prisma.user.findMany();
    console.log(`Found ${allUsers.length} user(s):`);
    allUsers.forEach((user) => {
      console.log(`- ${user.name ?? "No name"} (${user.email})`);
    });

    console.log("\nAll tests passed.\n");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
