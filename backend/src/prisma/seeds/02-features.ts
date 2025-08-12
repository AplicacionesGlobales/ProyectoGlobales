import { PrismaClient, FeatureCategory } from '../../../generated/prisma';

const prisma = new PrismaClient();

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

export async function seedFeatures() {
  console.log('⚡ Seeding features...');

  try {
    // Clear existing features
    await prisma.feature.deleteMany();

    // Insert new features
    for (const feature of features) {
      await prisma.feature.create({
        data: {
          key: feature.key,
          title: feature.title,
          subtitle: feature.subtitle,
          description: feature.description,
          price: feature.price,
          category: feature.category,
          isRecommended: feature.isRecommended,
          isPopular: feature.isPopular,
          order: feature.order,
          businessTypes: feature.businessTypes,
          isActive: true
        }
      });
    }

    console.log(`✅ Created ${features.length} features`);

    // Show summary by category
    const essential = features.filter(f => f.category === 'ESSENTIAL').length;
    const business = features.filter(f => f.category === 'BUSINESS').length;
    const advanced = features.filter(f => f.category === 'ADVANCED').length;

    console.log(`📈 Summary: Essential: ${essential}, Business: ${business}, Advanced: ${advanced} features`);
  } catch (error) {
    console.error('❌ Error seeding features:', error);
    throw error;
  }
}

// If run directly
if (require.main === module) {
  seedFeatures()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
