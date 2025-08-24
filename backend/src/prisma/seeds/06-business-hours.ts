import { PrismaClient } from '../../../generated/prisma';

const prisma = new PrismaClient();

const defaultBusinessHours = [
  // Lunes a Viernes: 8am - 5pm
  { dayOfWeek: 1, isOpen: true, openTime: '08:00', closeTime: '17:00' }, // Lunes
  { dayOfWeek: 2, isOpen: true, openTime: '08:00', closeTime: '17:00' }, // Martes
  { dayOfWeek: 3, isOpen: true, openTime: '08:00', closeTime: '17:00' }, // Miércoles
  { dayOfWeek: 4, isOpen: true, openTime: '08:00', closeTime: '17:00' }, // Jueves
  { dayOfWeek: 5, isOpen: true, openTime: '08:00', closeTime: '17:00' }, // Viernes
  { dayOfWeek: 6, isOpen: false }, // Sábado
  { dayOfWeek: 0, isOpen: false }  // Domingo
];

export async function seedBusinessHours() {
  console.log('🕒 Seeding business hours...');

  try {
    // Obtener todos los brands activos
    const brands = await prisma.brand.findMany({
      where: { isActive: true },
      select: { id: true }
    });

    let createdCount = 0;

    for (const brand of brands) {
      // Verificar si ya tiene horarios
      const existingHours = await prisma.businessHours.findMany({
        where: { brandId: brand.id }
      });

      if (existingHours.length === 0) {
        // Crear horarios por defecto
        for (const hourConfig of defaultBusinessHours) {
          await prisma.businessHours.create({
            data: {
              brandId: brand.id,
              dayOfWeek: hourConfig.dayOfWeek,
              isOpen: hourConfig.isOpen,
              openTime: hourConfig.openTime,
              closeTime: hourConfig.closeTime
            }
          });
        }
        createdCount++;
      }
    }

    console.log(`✅ Created default business hours for ${createdCount} brands`);
  } catch (error) {
    console.error('❌ Error seeding business hours:', error);
    throw error;
  }
}

// Si se ejecuta directamente
if (require.main === module) {
  seedBusinessHours()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}