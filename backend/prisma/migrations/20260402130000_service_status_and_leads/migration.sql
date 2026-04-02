-- CreateEnum
CREATE TYPE "ServiceStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ServiceLeadStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'CONVERTED_TO_ORDER', 'CLOSED');

-- AlterTable
ALTER TABLE "Service"
ADD COLUMN "status" "ServiceStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN "publishedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ServiceLead" (
    "id" UUID NOT NULL,
    "serviceId" UUID NOT NULL,
    "providerId" UUID NOT NULL,
    "customerUserId" UUID,
    "customerName" TEXT,
    "customerEmail" TEXT,
    "customerPhone" TEXT,
    "message" TEXT,
    "status" "ServiceLeadStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceLead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Service_status_idx" ON "Service"("status");

-- CreateIndex
CREATE INDEX "Service_providerId_status_idx" ON "Service"("providerId", "status");

-- CreateIndex
CREATE INDEX "ServiceLead_serviceId_status_idx" ON "ServiceLead"("serviceId", "status");

-- CreateIndex
CREATE INDEX "ServiceLead_providerId_status_idx" ON "ServiceLead"("providerId", "status");

-- CreateIndex
CREATE INDEX "ServiceLead_customerUserId_idx" ON "ServiceLead"("customerUserId");

-- AddForeignKey
ALTER TABLE "ServiceLead" ADD CONSTRAINT "ServiceLead_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceLead" ADD CONSTRAINT "ServiceLead_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceLead" ADD CONSTRAINT "ServiceLead_customerUserId_fkey" FOREIGN KEY ("customerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
