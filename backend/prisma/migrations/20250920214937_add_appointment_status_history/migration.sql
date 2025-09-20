-- CreateTable
CREATE TABLE "appointment_status_history" (
    "id" SERIAL NOT NULL,
    "appointmentId" INTEGER NOT NULL,
    "fromStatus" "AppointmentStatus" NOT NULL,
    "toStatus" "AppointmentStatus" NOT NULL,
    "reason" TEXT,
    "notes" TEXT,
    "changedBy" INTEGER NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appointment_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "appointment_status_history_appointmentId_idx" ON "appointment_status_history"("appointmentId");

-- CreateIndex
CREATE INDEX "appointment_status_history_changedBy_idx" ON "appointment_status_history"("changedBy");

-- CreateIndex
CREATE INDEX "appointment_status_history_createdAt_idx" ON "appointment_status_history"("createdAt");

-- AddForeignKey
ALTER TABLE "appointment_status_history" ADD CONSTRAINT "appointment_status_history_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_status_history" ADD CONSTRAINT "appointment_status_history_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
