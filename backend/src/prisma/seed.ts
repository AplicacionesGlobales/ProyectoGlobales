import { PrismaClient, UserRole } from '../../generated/prisma';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Limpiar datos existentes
  await prisma.userBranch.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.business.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing data');

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

  // Crear comercio principal
  const business = await prisma.business.create({
    data: {
      name: 'Barbershop Pro',
      description: 'La mejor cadena de barberías de la ciudad',
      ownerId: rootUser.id,
    }
  });

  console.log('✅ Created business:', business.name);

  // Crear múltiples sucursales
  const branches = await Promise.all([
    // Sucursal Centro
    prisma.branch.create({
      data: {
        name: 'Sucursal Centro',
        address: 'Av. Principal 123, Centro',
        phone: '+1234567890',
        businessId: business.id,
      }
    }),
    // Sucursal Norte  
    prisma.branch.create({
      data: {
        name: 'Sucursal Norte',
        address: 'Calle Norte 456, Zona Norte',
        phone: '+1234567891',
        businessId: business.id,
      }
    }),
    // Sucursal Sur
    prisma.branch.create({
      data: {
        name: 'Sucursal Sur',
        address: 'Av. Sur 789, Zona Sur',
        phone: '+1234567892',
        businessId: business.id,
      }
    })
  ]);

  console.log('✅ Created branches:');
  branches.forEach(branch => {
    console.log(`   - ${branch.name} (ID: ${branch.id})`);
  });

  // Crear algunos clientes de ejemplo
  const clientUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'juan@gmail.com',
        username: 'juan_perez',
        firstName: 'Juan',
        lastName: 'Pérez',
        role: UserRole.CLIENT,
      }
    }),
    prisma.user.create({
      data: {
        email: 'maria@gmail.com', 
        username: 'maria_gonzalez',
        firstName: 'María',
        lastName: 'González',
        role: UserRole.CLIENT,
      }
    })
  ]);

  console.log('✅ Created client users:');
  clientUsers.forEach(user => {
    console.log(`   - ${user.firstName} ${user.lastName} (@${user.username})`);
  });

  // Crear relaciones UserBranch (clientes registrados en sucursales)
  const passwordHash = await bcrypt.hash('password123', 12);
  
  const userBranches = await Promise.all([
    // Juan registrado en Sucursal Centro
    prisma.userBranch.create({
      data: {
        userId: clientUsers[0].id,
        branchId: branches[0].id,
        email: 'juan.centro@gmail.com',
        passwordHash,
        apiKey: generateApiKey(),
      }
    }),
    // María registrada en Sucursal Norte
    prisma.userBranch.create({
      data: {
        userId: clientUsers[1].id,
        branchId: branches[1].id,
        email: 'maria.norte@gmail.com', 
        passwordHash,
        apiKey: generateApiKey(),
      }
    }),
    // Juan también registrado en Sucursal Norte (mismo usuario, diferente sucursal)
    prisma.userBranch.create({
      data: {
        userId: clientUsers[0].id,
        branchId: branches[1].id,
        email: 'juan.norte@gmail.com',
        passwordHash,
        apiKey: generateApiKey(),
      }
    })
  ]);

  console.log('✅ Created user-branch relationships:');
  userBranches.forEach((ub, index) => {
    console.log(`   - User ${ub.userId} → Branch ${ub.branchId} (${ub.email})`);
  });

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📋 Datos disponibles para testing:');
  console.log('\n🏢 Business:');
  console.log(`   - ${business.name} (ID: ${business.id})`);
  
  console.log('\n🏪 Branches disponibles:');
  branches.forEach(branch => {
    console.log(`   - ${branch.name} (ID: ${branch.id})`);
    console.log(`     📍 ${branch.address}`);
    console.log(`     📞 ${branch.phone}`);
  });

  console.log('\n👥 Users para testing:');
  console.log(`   - ROOT: ${rootUser.username} (${rootUser.email})`);
  clientUsers.forEach(user => {
    console.log(`   - CLIENT: ${user.username} (${user.firstName} ${user.lastName})`);
  });

  console.log('\n🧪 Para probar el endpoint de registro:');
  console.log('POST /auth/register/client');
  console.log('Body ejemplo:');
  console.log(JSON.stringify({
    email: 'nuevo@gmail.com',
    username: 'nuevo_usuario',
    password: 'password123',
    firstName: 'Nuevo',
    lastName: 'Usuario',
    branchId: branches[0].id
  }, null, 2));
}

function generateApiKey(): string {
  return require('crypto').randomBytes(32).toString('hex');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
