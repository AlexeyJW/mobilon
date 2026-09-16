-- CreateEnum
CREATE TYPE "BonusCategory" AS ENUM ('SMARTPHONE', 'FEATURE_PHONE', 'ACCESSORY', 'SERVICE', 'NO_REWARD');

-- AlterTable
ALTER TABLE "Purchase" ADD COLUMN     "maxRewardPointsSnapshot" INTEGER;

-- AlterTable
ALTER TABLE "PurchaseLine" ADD COLUMN     "bonusCategory" "BonusCategory",
ADD COLUMN     "bonusEarned" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "rewardPercentSnapshot" DECIMAL(5,2);

-- CreateIndex
CREATE INDEX "PurchaseLine_bonusCategory_idx" ON "PurchaseLine"("bonusCategory");
