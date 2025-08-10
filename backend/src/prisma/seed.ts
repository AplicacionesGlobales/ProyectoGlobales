import { PrismaClient, UserRole } from '../../generated/prisma';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Crear usuario ROOT (dueño de comercio)
  const rootUser = await prisma.user.create({
    data: {
      email: 'owner@barbershop.com',
      username: 'barbershop_owner',
      firstName: 'Carlos',
      lastName: 'García',
      role: UserRole.ROOT,
    }
  });

  console.log('✅ Created root user:', rootUser.email);

  // Crear comercio
  const business = await prisma.business.create({
    data: {
      name: 'Barbershop Pro',
      description: 'La mejor barbería de la ciudad',
      ownerId: rootUser.id,
    }
  });

  console.log('✅ Created business:', business.name);

  // Crear sucursal
  const branch = await prisma.branch.create({
    data: {
      name: 'Sucursal Centro',
      address: 'Calle Principal 123',
      phone: '+1234567890',
      businessId: business.id,
    }
  });

  console.log('✅ Created branch:', branch.name);
  console.log('🎉 Seed completed!');
  console.log('\nPuedes usar estos datos para probar el registro de cliente:');
  console.log(`Branch ID: ${branch.id}`);
  console.log(`Business: ${business.name}`);
  console.log(`Branch: ${branch.name}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
