import { PrismaClient, UserRole } from '../../generated/prisma';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Limpiar datos existentes
  await prisma.userBrand.deleteMany();
  await prisma.colorPalette.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing data');

  // Crear usuario ROOT (dueño de marca)
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

  // Crear marca principal
  const mainBrand = await prisma.brand.create({
    data: {
      name: 'Barbershop Pro',
      description: 'La mejor barbería de la ciudad',
      address: 'Av. Principal 123, Centro',
      phone: '+1234567890',
      ownerId: rootUser.id,
    }
  });

  console.log('✅ Created brand:', mainBrand.name);

  // Crear paleta de colores para la marca
  const colorPalette = await prisma.colorPalette.create({
    data: {
      brandId: mainBrand.id,
      primary: '#1a73e8',
      secondary: '#34a853',
      accent: '#fbbc04',
      neutral: '#9aa0a6',
      success: '#137333',
    }
  });

  console.log('✅ Created color palette for brand:', mainBrand.name);

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

  // Crear algunos usuarios admin de ejemplo
  const adminUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@barbershop.com',
        username: 'admin_user',
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN,
      }
    })
  ]);

  console.log('✅ Created admin users:');
  adminUsers.forEach(user => {
    console.log(`   - ${user.firstName} ${user.lastName} (@${user.username})`);
  });

  // Crear relaciones UserBrand (clientes registrados en la marca)
  const passwordHash = await bcrypt.hash('password123', 12);
  const salt1 = 'salt_' + Date.now() + '_1';
  const salt2 = 'salt_' + Date.now() + '_2';
  const salt3 = 'salt_' + Date.now() + '_3';
  
  const userBrands = await Promise.all([
    // Juan registrado en la marca
    prisma.userBrand.create({
      data: {
        userId: clientUsers[0].id,
        brandId: mainBrand.id,
        email: 'juan.barbershop@gmail.com',
        passwordHash,
        salt: salt1,
      }
    }),
    // María registrada en la marca
    prisma.userBrand.create({
      data: {
        userId: clientUsers[1].id,
        brandId: mainBrand.id,
        email: 'maria.barbershop@gmail.com', 
        passwordHash,
        salt: salt2,
      }
    }),
    // Admin también registrado en la marca
    prisma.userBrand.create({
      data: {
        userId: adminUsers[0].id,
        brandId: mainBrand.id,
        email: 'admin.barbershop@gmail.com',
        passwordHash,
        salt: salt3,
      }
    })
  ]);

  console.log('✅ Created user-brand relationships:');
  userBrands.forEach((ub, index) => {
    console.log(`   - User ${ub.userId} → Brand ${ub.brandId} (${ub.email})`);
  });

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📋 Datos disponibles para testing:');
  console.log('\n🏢 Brand:');
  console.log(`   - ${mainBrand.name} (ID: ${mainBrand.id})`);
  console.log(`     📍 ${mainBrand.address}`);
  console.log(`     📞 ${mainBrand.phone}`);
  
  console.log('\n👥 Users para testing:');
  console.log(`   - ROOT: ${rootUser.username} (${rootUser.email})`);
  clientUsers.forEach(user => {
    console.log(`   - CLIENT: ${user.username} (${user.firstName} ${user.lastName})`);
  });
  adminUsers.forEach(user => {
    console.log(`   - ADMIN: ${user.username} (${user.firstName} ${user.lastName})`);
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
    branchId: mainBrand.id // Usamos brandId ahora
  }, null, 2));
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
