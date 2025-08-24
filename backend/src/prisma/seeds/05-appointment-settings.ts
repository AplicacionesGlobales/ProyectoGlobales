import { PrismaClient } from '../../../generated/prisma';

const prisma = new PrismaClient();

export async function seedAppointmentSettings() {
  console.log('⏰ Seeding appointment settings...');

  try {
    // Obtener todos los brands activos
    const brands = await prisma.brand.findMany({
      where: { isActive: true },
      select: { id: true }
    });

    let createdCount = 0;

    // Crear configuración para cada brand que no tenga una
    for (const brand of brands) {
      const existingSettings = await prisma.appointmentSettings.findUnique({
        where: { brandId: brand.id }
      });

      if (!existingSettings) {
        await prisma.appointmentSettings.create({
          data: {
            brandId: brand.id,
            defaultDuration: 30, // 30 minutos por defecto
            bufferTime: 5, // 5 minutos entre citas
            maxAdvanceBookingDays: 30, // 30 días de anticipación
            minAdvanceBookingHours: 2, // 2 horas mínimas de anticipación
            allowSameDayBooking: true
          }
        });
        createdCount++;
      }
    }

    console.log(`✅ Created/verified appointment settings for ${createdCount} brands`);
  } catch (error) {
    console.error('❌ Error seeding appointment settings:', error);
    throw error;
  }
}

// Si se ejecuta directamente
if (require.main === module) {
  seedAppointmentSettings()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}