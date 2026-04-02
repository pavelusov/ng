-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Order" (
    "id" UUID NOT NULL,
    "serviceLeadId" UUID NOT NULL,
    "serviceId" UUID NOT NULL,
    "providerId" UUID NOT NULL,
    "customerUserId" UUID NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_serviceLeadId_key" ON "Order"("serviceLeadId");

-- CreateIndex
CREATE INDEX "Order_providerId_status_idx" ON "Order"("providerId", "status");

-- CreateIndex
CREATE INDEX "Order_customerUserId_status_idx" ON "Order"("customerUserId", "status");

-- CreateIndex
CREATE INDEX "Order_serviceId_idx" ON "Order"("serviceId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_serviceLeadId_fkey" FOREIGN KEY ("serviceLeadId") REFERENCES "ServiceLead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerUserId_fkey" FOREIGN KEY ("customerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
