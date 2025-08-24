/*
  Warnings:

  - Made the column `firstName` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('APPOINTMENT_CREATED', 'APPOINTMENT_MODIFIED', 'APPOINTMENT_CANCELLED', 'APPOINTMENT_COMPLETED', 'APPOINTMENT_NO_SHOW', 'PAYMENT_RECEIVED', 'PAYMENT_FAILED', 'PAYMENT_REFUNDED', 'PROFILE_CREATED', 'PROFILE_UPDATED', 'PASSWORD_CHANGED', 'EMAIL_VERIFIED', 'NOTE_ADDED', 'REVIEW_SUBMITTED', 'RATING_GIVEN', 'FIRST_VISIT', 'MILESTONE_10_VISITS', 'MILESTONE_25_VISITS', 'MILESTONE_50_VISITS', 'MILESTONE_100_VISITS', 'LOGIN', 'LOGOUT', 'ACCOUNT_ACTIVATED', 'ACCOUNT_DEACTIVATED');

-- AlterTable
ALTER TABLE "user_brands" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "preferences" JSONB,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "phone" TEXT,
ALTER COLUMN "firstName" SET NOT NULL;

-- CreateTable
CREATE TABLE "client_notes" (
    "id" SERIAL NOT NULL,
    "clientId" INTEGER NOT NULL,
    "brandId" INTEGER NOT NULL,
    "note" TEXT NOT NULL,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_activities" (
    "id" SERIAL NOT NULL,
    "clientId" INTEGER NOT NULL,
    "brandId" INTEGER NOT NULL,
    "type" "ActivityType" NOT NULL,
    "description" TEXT NOT NULL,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "client_activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "client_notes_clientId_brandId_idx" ON "client_notes"("clientId", "brandId");

-- CreateIndex
CREATE INDEX "client_notes_createdBy_idx" ON "client_notes"("createdBy");

-- CreateIndex
CREATE INDEX "client_activities_clientId_brandId_idx" ON "client_activities"("clientId", "brandId");

-- CreateIndex
CREATE INDEX "client_activities_type_idx" ON "client_activities"("type");

-- CreateIndex
CREATE INDEX "client_activities_createdAt_idx" ON "client_activities"("createdAt");

-- AddForeignKey
ALTER TABLE "client_notes" ADD CONSTRAINT "client_notes_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_notes" ADD CONSTRAINT "client_notes_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_notes" ADD CONSTRAINT "client_notes_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_activities" ADD CONSTRAINT "client_activities_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_activities" ADD CONSTRAINT "client_activities_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;
