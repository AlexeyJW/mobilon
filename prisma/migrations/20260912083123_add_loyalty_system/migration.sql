/*
  Warnings:

  - A unique constraint covering the columns `[cardToken]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "BonusTransactionType" AS ENUM ('PURCHASE_REWARD', 'PURCHASE_PAYMENT', 'REFUND', 'ADMIN_ADJUSTMENT', 'EXPIRED', 'INITIAL_BALANCE');

-- CreateEnum
CREATE TYPE "PurchaseSource" AS ENUM ('MANUAL', 'FISCAL_QR');

-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('COMPLETED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED');

-- CreateEnum
CREATE TYPE "PurchaseLineType" AS ENUM ('PRODUCT', 'SERVICE', 'OTHER');

-- AlterTable
ALTER TABLE "BonusTransaction" ADD COLUMN     "description" TEXT,
ADD COLUMN     "policyId" INTEGER,
ADD COLUMN     "purchaseId" INTEGER,
ADD COLUMN     "rewardPercentSnapshot" DECIMAL(5,2),
ADD COLUMN     "type" "BonusTransactionType";

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "cardToken" TEXT,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "loyaltyActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "telegramChatId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "BonusPolicy" (
    "id" SERIAL NOT NULL,
    "rewardPercent" DECIMAL(5,2) NOT NULL,
    "maxRedeemPercent" DECIMAL(5,2) NOT NULL,
    "minPurchaseAmount" DECIMAL(10,2),
    "minRedeemPoints" INTEGER,
    "activationDelayDays" INTEGER NOT NULL DEFAULT 0,
    "expirationDays" INTEGER,
    "rewardProducts" BOOLEAN NOT NULL DEFAULT true,
    "rewardServices" BOOLEAN NOT NULL DEFAULT true,
    "rewardOnBonusPaidPart" BOOLEAN NOT NULL DEFAULT false,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BonusPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "bonusUsed" INTEGER NOT NULL DEFAULT 0,
    "paidAmount" DECIMAL(10,2) NOT NULL,
    "bonusEarned" INTEGER NOT NULL DEFAULT 0,
    "policyId" INTEGER,
    "rewardPercentSnapshot" DECIMAL(5,2),
    "maxRedeemPercentSnapshot" DECIMAL(5,2),
    "fiscalReceiptNumber" TEXT,
    "fiscalDeviceNumber" TEXT,
    "fiscalReceiptDate" TIMESTAMP(3),
    "fiscalReceiptUrl" TEXT,
    "source" "PurchaseSource" NOT NULL DEFAULT 'MANUAL',
    "status" "PurchaseStatus" NOT NULL DEFAULT 'COMPLETED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseLine" (
    "id" SERIAL NOT NULL,
    "purchaseId" INTEGER NOT NULL,
    "productId" INTEGER,
    "serviceId" INTEGER,
    "name" TEXT NOT NULL,
    "type" "PurchaseLineType" NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PurchaseLine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BonusPolicy_validFrom_idx" ON "BonusPolicy"("validFrom");

-- CreateIndex
CREATE INDEX "BonusPolicy_validTo_idx" ON "BonusPolicy"("validTo");

-- CreateIndex
CREATE INDEX "Purchase_customerId_idx" ON "Purchase"("customerId");

-- CreateIndex
CREATE INDEX "Purchase_createdAt_idx" ON "Purchase"("createdAt");

-- CreateIndex
CREATE INDEX "Purchase_policyId_idx" ON "Purchase"("policyId");

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_fiscalDeviceNumber_fiscalReceiptNumber_key" ON "Purchase"("fiscalDeviceNumber", "fiscalReceiptNumber");

-- CreateIndex
CREATE INDEX "PurchaseLine_purchaseId_idx" ON "PurchaseLine"("purchaseId");

-- CreateIndex
CREATE INDEX "PurchaseLine_productId_idx" ON "PurchaseLine"("productId");

-- CreateIndex
CREATE INDEX "PurchaseLine_serviceId_idx" ON "PurchaseLine"("serviceId");

-- CreateIndex
CREATE INDEX "BonusTransaction_customerId_idx" ON "BonusTransaction"("customerId");

-- CreateIndex
CREATE INDEX "BonusTransaction_purchaseId_idx" ON "BonusTransaction"("purchaseId");

-- CreateIndex
CREATE INDEX "BonusTransaction_policyId_idx" ON "BonusTransaction"("policyId");

-- CreateIndex
CREATE INDEX "BonusTransaction_createdAt_idx" ON "BonusTransaction"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_cardToken_key" ON "Customer"("cardToken");

-- CreateIndex
CREATE INDEX "Customer_active_idx" ON "Customer"("active");

-- AddForeignKey
ALTER TABLE "BonusTransaction" ADD CONSTRAINT "BonusTransaction_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BonusTransaction" ADD CONSTRAINT "BonusTransaction_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "BonusPolicy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "BonusPolicy"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseLine" ADD CONSTRAINT "PurchaseLine_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "Purchase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseLine" ADD CONSTRAINT "PurchaseLine_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseLine" ADD CONSTRAINT "PurchaseLine_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;
