// seed-features.js - Script para agregar features de prueba
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedFeatures() {
  console.log('🌱 Agregando features de prueba...');

  const features = [
    {
      key: 'advanced_reports',
      title: 'Reportes Avanzados',
      description: 'Sistema completo de reportes y analíticas avanzadas',
      price: 15.0,
      category: 'BUSINESS',
      businessTypes: ['barbershop', 'salon', 'spa'],
      isActive: true,
    },
    {
      key: 'multi_location',
      title: 'Multi-Sucursal',
      description: 'Gestión de múltiples ubicaciones desde un solo panel',
      price: 25.0,
      category: 'BUSINESS',
      businessTypes: ['barbershop', 'salon', 'restaurant'],
      isActive: true,
    },
    {
      key: 'customer_crm',
      title: 'CRM Avanzado',
      description: 'Sistema completo de gestión de relaciones con clientes',
      price: 20.0,
      category: 'ADVANCED',
      businessTypes: ['barbershop', 'salon', 'spa'],
      isActive: true,
    },
    {
      key: 'online_booking',
      title: 'Reservas Online',
      description: 'Sistema de reservas online 24/7 para tus clientes',
      price: 18.0,
      category: 'ESSENTIAL',
      businessTypes: ['barbershop', 'salon', 'spa', 'restaurant'],
      isActive: true,
    },
    {
      key: 'payment_processing',
      title: 'Procesamiento de Pagos',
      description: 'Integración completa con pasarelas de pago',
      price: 30.0,
      category: 'BUSINESS',
      businessTypes: ['barbershop', 'salon', 'spa', 'restaurant'],
      isActive: true,
    },
  ];

  for (const feature of features) {
    try {
      const created = await prisma.feature.create({
        data: feature,
      });
      console.log(`✅ Feature creada: ${created.title} (ID: ${created.id})`);
    } catch (error) {
      if (error.code === 'P2002') {
        console.log(`⚠️  Feature ya existe: ${feature.title}`);
      } else {
        console.error(`❌ Error creando feature ${feature.title}:`, error);
      }
    }
  }

  console.log('🎉 Features de prueba agregadas!');
}

seedFeatures()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
