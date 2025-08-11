/*
  Warnings:

  - Added subscription plans, features, and payment support
  - Added business type and feature selection to brands
  - Added payment processing with TiloPay integration
*/

-- Add business type and features to Brand
ALTER TABLE "brands" ADD COLUMN "businessType" TEXT;
ALTER TABLE "brands" ADD COLUMN "selectedFeatures" TEXT[];

-- CreateEnum for PlanType
CREATE TYPE "PlanType" AS ENUM ('web', 'app', 'complete');

-- CreateEnum for BillingPeriod  
CREATE TYPE "BillingPeriod" AS ENUM ('monthly', 'annual');

-- CreateEnum for PaymentStatus
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');

-- CreateTable Plan
CREATE TABLE "plans" (
    "id" SERIAL NOT NULL,
    "type" "PlanType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "basePrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable Feature
CREATE TABLE "features" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "features_pkey" PRIMARY KEY ("id")
);

-- CreateTable BrandPlan (subscription info)
CREATE TABLE "brand_plans" (
    "id" SERIAL NOT NULL,
    "brandId" INTEGER NOT NULL,
    "planId" INTEGER NOT NULL,
    "billingPeriod" "BillingPeriod" NOT NULL DEFAULT 'monthly',
    "price" DECIMAL(10,2) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brand_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable BrandFeature (many-to-many between Brand and Feature)
CREATE TABLE "brand_features" (
    "id" SERIAL NOT NULL,
    "brandId" INTEGER NOT NULL,
    "featureId" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brand_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable Payment
CREATE TABLE "payments" (
    "id" SERIAL NOT NULL,
    "brandId" INTEGER NOT NULL,
    "brandPlanId" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CRC',
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "paymentMethod" TEXT,
    "tilopayTransactionId" TEXT,
    "tilopayReference" TEXT,
    "metadata" JSONB,
    "processedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable CustomColor (for storing custom colors per brand)
CREATE TABLE "custom_colors" (
    "id" SERIAL NOT NULL,
    "brandId" INTEGER NOT NULL,
    "colorHex" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_colors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "features_key_key" ON "features"("key");

-- CreateIndex  
CREATE UNIQUE INDEX "brand_features_brandId_featureId_key" ON "brand_features"("brandId", "featureId");

-- CreateIndex
CREATE INDEX "payments_brandId_idx" ON "payments"("brandId");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "payments_tilopayTransactionId_key" ON "payments"("tilopayTransactionId");

-- AddForeignKey
ALTER TABLE "brand_plans" ADD CONSTRAINT "brand_plans_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE CASCADE;

-- AddForeignKey  
ALTER TABLE "brand_plans" ADD CONSTRAINT "brand_plans_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plans"("id") ON DELETE RESTRICT;

-- AddForeignKey
ALTER TABLE "brand_features" ADD CONSTRAINT "brand_features_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE CASCADE;

-- AddForeignKey
ALTER TABLE "brand_features" ADD CONSTRAINT "brand_features_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "features"("id") ON DELETE RESTRICT;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_brandPlanId_fkey" FOREIGN KEY ("brandPlanId") REFERENCES "brand_plans"("id") ON DELETE RESTRICT;

-- AddForeignKey
ALTER TABLE "custom_colors" ADD CONSTRAINT "custom_colors_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE CASCADE;
