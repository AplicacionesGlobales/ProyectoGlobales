/*
  Warnings:

  - You are about to drop the column `name` on the `features` table. All the data in the column will be lost.
  - Added the required column `category` to the `features` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `features` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `features` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "FeatureCategory" AS ENUM ('ESSENTIAL', 'BUSINESS', 'ADVANCED');

-- Add new columns with temporary defaults first
ALTER TABLE "features" 
ADD COLUMN "businessTypes" TEXT[] DEFAULT '{}',
ADD COLUMN "category" "FeatureCategory" DEFAULT 'ESSENTIAL',
ADD COLUMN "isPopular" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "isRecommended" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "subtitle" TEXT,
ADD COLUMN "title" TEXT DEFAULT 'Unknown Feature';

-- Update existing data - migrate from 'name' to 'title' and set appropriate categories
UPDATE "features" SET 
  "title" = "name",
  "description" = COALESCE("description", 'Feature description'),
  "category" = CASE 
    WHEN "key" IN ('appointments', 'payments', 'clients') THEN 'ESSENTIAL'::"FeatureCategory"
    WHEN "key" IN ('locations', 'files', 'galleries', 'reminders') THEN 'BUSINESS'::"FeatureCategory"
    WHEN "key" IN ('reports', 'tracking') THEN 'ADVANCED'::"FeatureCategory"
    ELSE 'ESSENTIAL'::"FeatureCategory"
  END,
  "isRecommended" = CASE 
    WHEN "key" IN ('appointments', 'payments', 'locations', 'files', 'galleries') THEN true
    ELSE false
  END,
  "isPopular" = CASE 
    WHEN "key" IN ('appointments', 'payments', 'clients') THEN true
    ELSE false
  END,
  "order" = CASE 
    WHEN "key" = 'appointments' THEN 1
    WHEN "key" = 'payments' THEN 2
    WHEN "key" = 'clients' THEN 3
    WHEN "key" = 'locations' THEN 4
    WHEN "key" = 'files' THEN 5
    WHEN "key" = 'galleries' THEN 6
    WHEN "key" = 'reminders' THEN 7
    WHEN "key" = 'reports' THEN 8
    WHEN "key" = 'tracking' THEN 9
    ELSE 99
  END;

-- Now make the required columns NOT NULL and drop the old column
ALTER TABLE "features" 
ALTER COLUMN "category" DROP DEFAULT,
ALTER COLUMN "title" DROP DEFAULT,
ALTER COLUMN "title" SET NOT NULL,
ALTER COLUMN "description" SET NOT NULL,
DROP COLUMN "name";
