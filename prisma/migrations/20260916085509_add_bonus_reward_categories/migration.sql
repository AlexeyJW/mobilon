-- AlterTable
ALTER TABLE "BonusPolicy" ADD COLUMN     "accessoryRewardPercent" DECIMAL(5,2) NOT NULL DEFAULT 5,
ADD COLUMN     "featurePhoneRewardPercent" DECIMAL(5,2) NOT NULL DEFAULT 2,
ADD COLUMN     "maxRewardPoints" INTEGER DEFAULT 300,
ADD COLUMN     "serviceRewardPercent" DECIMAL(5,2) NOT NULL DEFAULT 5,
ADD COLUMN     "smartphoneRewardPercent" DECIMAL(5,2) NOT NULL DEFAULT 1;
