-- CreateTable
CREATE TABLE "public"."business_hours" (
    "id" SERIAL NOT NULL,
    "brandId" INTEGER NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "openTime" TEXT,
    "closeTime" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."special_hours" (
    "id" SERIAL NOT NULL,
    "brandId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT false,
    "openTime" TEXT,
    "closeTime" TEXT,
    "reason" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "special_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."appointment_settings" (
    "id" SERIAL NOT NULL,
    "brandId" INTEGER NOT NULL,
    "defaultDuration" INTEGER NOT NULL DEFAULT 30,
    "bufferTime" INTEGER NOT NULL DEFAULT 5,
    "maxAdvanceBookingDays" INTEGER NOT NULL DEFAULT 30,
    "minAdvanceBookingHours" INTEGER NOT NULL DEFAULT 2,
    "allowSameDayBooking" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointment_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "business_hours_brandId_dayOfWeek_key" ON "public"."business_hours"("brandId", "dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "special_hours_brandId_date_key" ON "public"."special_hours"("brandId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "appointment_settings_brandId_key" ON "public"."appointment_settings"("brandId");

-- AddForeignKey
ALTER TABLE "public"."business_hours" ADD CONSTRAINT "business_hours_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "public"."brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."special_hours" ADD CONSTRAINT "special_hours_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "public"."brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."appointment_settings" ADD CONSTRAINT "appointment_settings_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "public"."brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;
