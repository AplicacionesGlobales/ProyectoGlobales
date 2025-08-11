-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'ADMIN';

-- AlterTable
ALTER TABLE "brands" ADD COLUMN     "imagotipoUrl" TEXT,
ADD COLUMN     "isotopoUrl" TEXT,
ADD COLUMN     "logoUrl" TEXT;
