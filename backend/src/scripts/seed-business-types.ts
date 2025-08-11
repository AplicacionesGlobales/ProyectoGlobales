import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

const businessTypes = [
  {
    key: 'photographer',
    title: 'Fotógrafo',
    subtitle: 'Photographer',
    description: 'Servicios de fotografía profesional, sesiones, eventos y retratos',
    icon: 'Camera',
    order: 1
  },
  {
    key: 'masseur',
    title: 'Masajista',
    subtitle: 'Masseur',
    description: 'Servicios de masajes terapéuticos y relajantes',
    icon: 'Hand',
    order: 2
  },
  {
    key: 'trainer',
    title: 'Entrenador Personal',
    subtitle: 'Personal Trainer',
    description: 'Entrenamiento físico personalizado y coaching deportivo',
    icon: 'Dumbbell',
    order: 3
  },
  {
    key: 'hairstylist',
    title: 'Estilista',
    subtitle: 'Hairstylist',
    description: 'Servicios de peluquería y estilismo profesional',
    icon: 'Scissors',
    order: 4
  },
  {
    key: 'beautician',
    title: 'Esteticista',
    subtitle: 'Beautician',
    description: 'Tratamientos de belleza y cuidado de la piel',
    icon: 'Sparkles',
    order: 5
  },
  {
    key: 'consultant',
    title: 'Consultor',
    subtitle: 'Consultant',
    description: 'Servicios de consultoría y asesoramiento profesional',
    icon: 'UserCheck',
    order: 6
  },
  {
    key: 'psychologist',
    title: 'Psicólogo',
    subtitle: 'Psychologist',
    description: 'Servicios de psicología y terapia',
    icon: 'Brain',
    order: 7
  },
  {
    key: 'dentist',
    title: 'Dentista',
    subtitle: 'Dentist',
    description: 'Servicios dentales y odontológicos',
    icon: 'Smile',
    order: 8
  },
  {
    key: 'lawyer',
    title: 'Abogado',
    subtitle: 'Lawyer',
    description: 'Servicios legales y asesoría jurídica',
    icon: 'Scale',
    order: 9
  },
  {
    key: 'doctor',
    title: 'Médico',
    subtitle: 'Doctor',
    description: 'Servicios médicos y consultas especializadas',
    icon: 'Stethoscope',
    order: 10
  },
  {
    key: 'teacher',
    title: 'Profesor Particular',
    subtitle: 'Private Teacher',
    description: 'Clases particulares y tutorías académicas',
    icon: 'GraduationCap',
    order: 11
  },
  {
    key: 'mechanic',
    title: 'Mecánico',
    subtitle: 'Mechanic',
    description: 'Servicios de reparación automotriz',
    icon: 'Wrench',
    order: 12
  }
];

async function main() {
  console.log('🏢 Starting business types seed...');

  try {
    // First, clear existing business types
    console.log('🗑️ Clearing existing business types...');
    await prisma.businessType.deleteMany();

    // Insert new business types
    console.log('📝 Creating business types...');
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
      console.log(`✅ Created business type: ${businessType.title}`);
    }

    console.log('🎉 Business types seed completed successfully!');
    console.log(`📊 Created ${businessTypes.length} business types`);
    
  } catch (error) {
    console.error('❌ Error seeding business types:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
