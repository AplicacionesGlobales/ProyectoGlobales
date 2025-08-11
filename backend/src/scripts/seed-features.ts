import { PrismaClient } from '../../generated/prisma';

const prisma = new PrismaClient();

const features = [
  // ESSENTIAL Features
  {
    key: 'appointments',
    title: 'Appointment System',
    subtitle: 'Sistema de Citas',
    description: 'Online appointment scheduling and management',
    price: 15.00,
    category: 'ESSENTIAL',
    isRecommended: true,
    isPopular: true,
    order: 1,
    businessTypes: ['photographer', 'masseur', 'trainer', 'consultant']
  },
  {
    key: 'payments',
    title: 'Online Payments',
    subtitle: 'Pagos Online',
    description: 'Process payments and billing',
    price: 10.00,
    category: 'ESSENTIAL',
    isRecommended: true,
    isPopular: true,
    order: 2,
    businessTypes: []
  },
  {
    key: 'clients',
    title: 'Client Database',
    subtitle: 'Base de Clientes',
    description: 'Client information management',
    price: 8.00,
    category: 'ESSENTIAL',
    isRecommended: false,
    isPopular: true,
    order: 3,
    businessTypes: []
  },

  // BUSINESS Features
  {
    key: 'locations',
    title: 'Home Services',
    subtitle: 'Servicios a Domicilio',
    description: 'For businesses that go to the client (photographers, masseurs, trainers)',
    price: 12.00,
    category: 'BUSINESS',
    isRecommended: true,
    isPopular: false,
    order: 4,
    businessTypes: ['photographer', 'masseur', 'trainer']
  },
  {
    key: 'files',
    title: 'File Management',
    subtitle: 'Gestión de Archivos',
    description: 'File storage and sharing',
    price: 7.00,
    category: 'BUSINESS',
    isRecommended: true,
    isPopular: false,
    order: 5,
    businessTypes: ['photographer', 'designer', 'consultant']
  },
  {
    key: 'galleries',
    title: 'Work Galleries',
    subtitle: 'Galerías de Trabajo',
    description: 'Showcase your visual portfolio',
    price: 9.00,
    category: 'BUSINESS',
    isRecommended: true,
    isPopular: false,
    order: 6,
    businessTypes: ['photographer', 'designer', 'artist']
  },
  {
    key: 'reminders',
    title: 'Email Reminders',
    subtitle: 'Recordatorios Email',
    description: 'Automatic email notifications',
    price: 6.00,
    category: 'BUSINESS',
    isRecommended: false,
    isPopular: false,
    order: 7,
    businessTypes: []
  },

  // ADVANCED Features
  {
    key: 'reports',
    title: 'Advanced Reports',
    subtitle: 'Reportes Avanzados',
    description: 'Business analytics and metrics',
    price: 18.00,
    category: 'ADVANCED',
    isRecommended: false,
    isPopular: false,
    order: 8,
    businessTypes: []
  },
  {
    key: 'tracking',
    title: 'Progress Tracking',
    subtitle: 'Seguimiento de Progreso',
    description: 'Track goals and results',
    price: 14.00,
    category: 'ADVANCED',
    isRecommended: false,
    isPopular: false,
    order: 9,
    businessTypes: ['trainer', 'consultant', 'coach']
  }
];

async function main() {
  console.log('🌱 Starting features seed...');

  try {
    // First, clear existing features
    console.log('🗑️ Clearing existing features...');
    await prisma.feature.deleteMany();

    // Insert new features
    console.log('📝 Creating features...');
    for (const feature of features) {
      await prisma.feature.create({
        data: {
          key: feature.key,
          title: feature.title,
          subtitle: feature.subtitle,
          description: feature.description,
          price: feature.price,
          category: feature.category as any,
          isRecommended: feature.isRecommended,
          isPopular: feature.isPopular,
          order: feature.order,
          businessTypes: feature.businessTypes,
          isActive: true
        }
      });
      console.log(`✅ Created feature: ${feature.title}`);
    }

    console.log('🎉 Features seed completed successfully!');
    console.log(`📊 Created ${features.length} features`);

    // Show summary by category
    const essential = features.filter(f => f.category === 'ESSENTIAL').length;
    const business = features.filter(f => f.category === 'BUSINESS').length;
    const advanced = features.filter(f => f.category === 'ADVANCED').length;

    console.log(`\n📈 Summary:`);
    console.log(`   Essential: ${essential} features`);
    console.log(`   Business: ${business} features`);
    console.log(`   Advanced: ${advanced} features`);
    
  } catch (error) {
    console.error('❌ Error seeding features:', error);
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
