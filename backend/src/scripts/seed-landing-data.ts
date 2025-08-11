import { PrismaClient, FeatureCategory, PlanType } from '../../generated/prisma';

const prisma = new PrismaClient();

// Datos de business types que coincidan con el landing
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

// Features que coincidan con el landing
const features = [
  // Core/Essential Features
  {
    key: 'citas',
    title: 'Sistema de Citas',
    subtitle: 'Appointment System',
    description: 'Agenda y gestión de citas online con calendario integrado',
    price: 15.00,
    category: 'ESSENTIAL' as FeatureCategory,
    isRecommended: true,
    isPopular: true,
    order: 1,
    businessTypes: ['fotografo', 'camarografo', 'medico', 'estilista', 'consultor', 'masajista', 'entrenador', 'otro']
  },
  {
    key: 'pagos',
    title: 'Pagos Online',
    subtitle: 'Online Payments',
    description: 'Procesar pagos con tarjeta, transferencias y facturación automática',
    price: 10.00,
    category: 'ESSENTIAL' as FeatureCategory,
    isRecommended: true,
    isPopular: true,
    order: 2,
    businessTypes: ['fotografo', 'camarografo', 'medico', 'estilista', 'consultor', 'masajista', 'entrenador', 'otro']
  },
  {
    key: 'clientes',
    title: 'Base de Clientes',
    subtitle: 'Client Database',
    description: 'Gestión completa de información de clientes, historial y preferencias',
    price: 8.00,
    category: 'ESSENTIAL' as FeatureCategory,
    isRecommended: true,
    isPopular: true,
    order: 3,
    businessTypes: ['fotografo', 'camarografo', 'medico', 'estilista', 'consultor', 'masajista', 'entrenador']
  },

  // Business Features
  {
    key: 'ubicaciones',
    title: 'Servicios a Domicilio',
    subtitle: 'Home Services',
    description: 'Para negocios que van donde el cliente (fotógrafos, masajistas, entrenadores)',
    price: 12.00,
    category: 'BUSINESS' as FeatureCategory,
    isRecommended: false,
    isPopular: false,
    order: 4,
    businessTypes: ['fotografo', 'camarografo', 'masajista', 'entrenador']
  },
  {
    key: 'archivos',
    title: 'Gestión de Archivos',
    subtitle: 'File Management',
    description: 'Almacenamiento seguro y compartir archivos con clientes',
    price: 7.00,
    category: 'BUSINESS' as FeatureCategory,
    isRecommended: false,
    isPopular: false,
    order: 5,
    businessTypes: ['fotografo', 'camarografo', 'medico', 'consultor']
  },
  {
    key: 'galerias',
    title: 'Galerías de Trabajo',
    subtitle: 'Work Galleries',
    description: 'Mostrar tu portafolio visual y trabajos realizados',
    price: 9.00,
    category: 'BUSINESS' as FeatureCategory,
    isRecommended: false,
    isPopular: false,
    order: 6,
    businessTypes: ['fotografo', 'camarografo', 'estilista']
  },
  {
    key: 'recordatorios',
    title: 'Recordatorios Email',
    subtitle: 'Email Reminders',
    description: 'Notificaciones automáticas por email a clientes',
    price: 6.00,
    category: 'BUSINESS' as FeatureCategory,
    isRecommended: false,
    isPopular: true,
    order: 7,
    businessTypes: ['medico', 'estilista', 'masajista']
  },

  // Advanced Features
  {
    key: 'reportes',
    title: 'Reportes Avanzados',
    subtitle: 'Advanced Reports',
    description: 'Analytics detallados y métricas de tu negocio',
    price: 18.00,
    category: 'ADVANCED' as FeatureCategory,
    isRecommended: false,
    isPopular: false,
    order: 8,
    businessTypes: ['medico', 'consultor']
  },
  {
    key: 'seguimiento',
    title: 'Seguimiento de Progreso',
    subtitle: 'Progress Tracking',
    description: 'Seguimiento de objetivos y resultados de clientes',
    price: 14.00,
    category: 'ADVANCED' as FeatureCategory,
    isRecommended: false,
    isPopular: false,
    order: 9,
    businessTypes: ['entrenador']
  }
];

// Planes
const plans = [
  {
    type: 'web' as PlanType,
    name: 'Solo Web',
    description: 'Perfecto para empezar online',
    basePrice: 0.00,
  },
  {
    type: 'app' as PlanType,
    name: 'Solo App Móvil',
    description: 'La experiencia móvil completa',
    basePrice: 59.00,
  },
  {
    type: 'complete' as PlanType,
    name: 'Web + App Completa',
    description: 'La solución completa para tu negocio',
    basePrice: 60.00,
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting seed process...');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await prisma.brandFeature.deleteMany();
    await prisma.feature.deleteMany();
    await prisma.businessType.deleteMany();
    await prisma.brandPlan.deleteMany();
    await prisma.plan.deleteMany();

    // Seed business types
    console.log('📋 Seeding business types...');
    for (const businessType of businessTypes) {
      await prisma.businessType.upsert({
        where: { key: businessType.key },
        update: businessType,
        create: businessType,
      });
    }
    console.log(`✅ Created ${businessTypes.length} business types`);

    // Seed features
    console.log('⚡ Seeding features...');
    for (const feature of features) {
      await prisma.feature.upsert({
        where: { key: feature.key },
        update: feature,
        create: feature,
      });
    }
    console.log(`✅ Created ${features.length} features`);

    // Seed plans
    console.log('💳 Seeding plans...');
    for (const plan of plans) {
      await prisma.plan.upsert({
        where: { type: plan.type },
        update: plan,
        create: plan,
      });
    }
    console.log(`✅ Created ${plans.length} plans`);

    console.log('🎉 Seed process completed successfully!');
  } catch (error) {
    console.error('❌ Seed process failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed
seedDatabase()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
