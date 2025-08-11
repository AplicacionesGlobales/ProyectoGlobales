/*
  Warnings:

  - Made the column `category` on table `features` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "features" ALTER COLUMN "businessTypes" DROP DEFAULT,
ALTER COLUMN "category" SET NOT NULL;

-- CreateTable
CREATE TABLE "business_types" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_types_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "business_types_key_key" ON "business_types"("key");
