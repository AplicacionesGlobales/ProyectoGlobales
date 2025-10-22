import { PrismaClient, PlanType } from '../../../generated/prisma';

const prisma = new PrismaClient();

const plans = [
  {
    type: 'web' as PlanType,
    name: 'Solo Web',
    description: 'Perfecto para empezar online',
    basePrice: 0.0,
  },
  {
    type: 'app' as PlanType,
    name: 'Solo App Móvil',
    description: 'La experiencia móvil completa',
    basePrice: 59.0,
  },
  {
    type: 'complete' as PlanType,
    name: 'Web + App Completa',
    description: 'La solución completa para tu negocio',
    basePrice: 60.0,
  },
];

export async function seedPlans() {
  console.log('💳 Seeding plans...');

  try {
    // Clear existing plans
    await prisma.brandPlan.deleteMany();
    await prisma.plan.deleteMany();

    // Insert new plans
    for (const plan of plans) {
      await prisma.plan.create({
        data: {
          type: plan.type,
          name: plan.name,
          description: plan.description,
          basePrice: plan.basePrice,
        },
      });
    }

    console.log(`✅ Created ${plans.length} plans`);
  } catch (error) {
    console.error('❌ Error seeding plans:', error);
    throw error;
  }
}

// If run directly
if (require.main === module) {
  seedPlans()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
