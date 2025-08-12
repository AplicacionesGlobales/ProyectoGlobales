import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

const businessTypes = [
  {
    key: 'fotografo',
    title: 'Fotógrafo',
    subtitle: 'Fotografia Profesional',
    description: 'Servicios de fotografía profesional, sesiones, eventos y retratos',
    icon: 'Camera',
    order: 1
  },
  {
    key: 'camarografo',
    title: 'Camarógrafo',
    subtitle: 'Video Profesional',
    description: 'Servicios de videografía profesional, eventos, comerciales y documentales',
    icon: 'Video',
    order: 2
  },
  {
    key: 'medico',
    title: 'Médico/Dentista',
    subtitle: 'Servicios Médicos',
    description: 'Consultorio médico y dental, citas, historiales y tratamientos',
    icon: 'Stethoscope',
    order: 3
  },
  {
    key: 'estilista',
    title: 'Estilista/Barbero',
    subtitle: 'Servicios de Belleza',
    description: 'Salón de belleza, peluquería, barbería y servicios de estilismo',
    icon: 'Scissors',
    order: 4
  },
  {
    key: 'consultor',
    title: 'Consultor',
    subtitle: 'Consultoría Profesional',
    description: 'Servicios de consultoría y asesoramiento profesional en diversas áreas',
    icon: 'Briefcase',
    order: 5
  },
  {
    key: 'masajista',
    title: 'Masajista/Spa',
    subtitle: 'Bienestar y Relajación',
    description: 'Servicios de masajes, spa, relajación y bienestar',
    icon: 'Hand',
    order: 6
  },
  {
    key: 'entrenador',
    title: 'Entrenador Personal',
    subtitle: 'Fitness y Entrenamiento',
    description: 'Entrenamiento físico personalizado, coaching deportivo y fitness',
    icon: 'Dumbbell',
    order: 7
  },
  {
    key: 'otro',
    title: 'Otro Servicio',
    subtitle: 'Servicios Personalizados',
    description: 'Configura tu app para cualquier otro tipo de servicio',
    icon: 'Settings',
    order: 8
  }
];

export async function seedBusinessTypes() {
  console.log('🏢 Seeding business types...');

  try {
    // Clear existing business types
    await prisma.businessType.deleteMany();

    // Insert new business types
    for (const businessType of businessTypes) {
      await prisma.businessType.create({
        data: {
          key: businessType.key,
          title: businessType.title,
          subtitle: businessType.subtitle,
          description: businessType.description,
          icon: businessType.icon,
          order: businessType.order,
          isActive: true
        }
      });
    }

    console.log(`✅ Created ${businessTypes.length} business types`);
  } catch (error) {
    console.error('❌ Error seeding business types:', error);
    throw error;
  }
}

// If run directly
if (require.main === module) {
  seedBusinessTypes()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
