/*
  Warnings:

  - You are about to drop the column `imagotipoUrl` on the `brands` table. All the data in the column will be lost.
  - You are about to drop the column `isotipoUrl` on the `brands` table. All the data in the column will be lost.
  - You are about to drop the column `logoUrl` on the `brands` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "brands" DROP COLUMN "imagotipoUrl",
DROP COLUMN "isotipoUrl",
DROP COLUMN "logoUrl";
