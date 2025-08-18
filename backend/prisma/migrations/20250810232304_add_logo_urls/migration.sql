-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'ADMIN';

-- AlterTable
ALTER TABLE "brands" ADD COLUMN     "imagotipoUrl" TEXT,
ADD COLUMN     "isotipoUrl" TEXT,
ADD COLUMN     "logoUrl" TEXT;
