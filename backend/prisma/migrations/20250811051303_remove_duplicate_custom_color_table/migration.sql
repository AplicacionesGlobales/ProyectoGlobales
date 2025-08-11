/*
  Warnings:

  - You are about to drop the `custom_colors` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "custom_colors" DROP CONSTRAINT "custom_colors_brandId_fkey";

-- DropTable
DROP TABLE "custom_colors";
