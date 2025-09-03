-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "price" DECIMAL(10,2),
ADD COLUMN     "serviceTypeId" INTEGER;

-- AlterTable
ALTER TABLE "appointment_settings" ADD COLUMN     "useServiceTypes" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "service_types" (
    "id" SERIAL NOT NULL,
    "brandId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "duration" INTEGER NOT NULL,
    "price" DECIMAL(10,2),
    "color" TEXT,
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_types_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "service_types_brandId_idx" ON "service_types"("brandId");

-- CreateIndex
CREATE UNIQUE INDEX "service_types_brandId_name_key" ON "service_types"("brandId", "name");

-- CreateIndex
CREATE INDEX "Appointment_serviceTypeId_idx" ON "Appointment"("serviceTypeId");

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_serviceTypeId_fkey" FOREIGN KEY ("serviceTypeId") REFERENCES "service_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_types" ADD CONSTRAINT "service_types_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;
