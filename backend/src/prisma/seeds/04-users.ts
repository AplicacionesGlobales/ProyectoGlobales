import { PrismaClient, UserRole } from '../../../generated/prisma';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function seedUsers() {
  console.log('👥 Seeding users and brands...');

  try {
    // Clear existing data
    await prisma.userBrand.deleteMany();
    await prisma.colorPalette.deleteMany();
    await prisma.brand.deleteMany();
    await prisma.user.deleteMany();

    console.log('🧹 Cleaned existing user data');

    // Create ROOT user (brand owner)
    const rootUser = await prisma.user.create({
      data: {
        email: 'owner@barbershop.com',
        username: 'barbershop_owner',
        firstName: 'Carlos',
        lastName: 'García',
        role: UserRole.ROOT,
      },
    });

    console.log('✅ Created root user:', rootUser.email);

    // Create main brand
    const mainBrand = await prisma.brand.create({
      data: {
        name: 'Barbershop Pro',
        description: 'La mejor barbería de la ciudad',
        address: 'Av. Principal 123, Centro',
        phone: '+1234567890',
        ownerId: rootUser.id,
      },
    });

    console.log('✅ Created brand:', mainBrand.name);

    // Create color palette for the brand
    const colorPalette = await prisma.colorPalette.create({
      data: {
        brandId: mainBrand.id,
        primary: '#1a73e8',
        secondary: '#34a853',
        accent: '#fbbc04',
        neutral: '#9aa0a6',
        success: '#137333',
      },
    });

    console.log('✅ Created color palette for brand:', mainBrand.name);

    // Create sample client users
    const clientUsers = await Promise.all([
      prisma.user.create({
        data: {
          email: 'juan@gmail.com',
          username: 'juan_perez',
          firstName: 'Juan',
          lastName: 'Pérez',
          role: UserRole.CLIENT,
        },
      }),
      prisma.user.create({
        data: {
          email: 'maria@gmail.com',
          username: 'maria_gonzalez',
          firstName: 'María',
          lastName: 'González',
          role: UserRole.CLIENT,
        },
      }),
    ]);

    console.log('✅ Created client users:');
    clientUsers.forEach((user) => {
      console.log(
        `   - ${user.firstName} ${user.lastName} (@${user.username})`,
      );
    });

    // Create admin users
    const adminUsers = await Promise.all([
      prisma.user.create({
        data: {
          email: 'admin@barbershop.com',
          username: 'admin_user',
          firstName: 'Admin',
          lastName: 'User',
          role: UserRole.ADMIN,
        },
      }),
    ]);

    console.log('✅ Created admin users:');
    adminUsers.forEach((user) => {
      console.log(
        `   - ${user.firstName} ${user.lastName} (@${user.username})`,
      );
    });

    // Create UserBrand relationships for ALL users (including ROOT)
    const passwordHash = await bcrypt.hash('password123', 12);
    const saltRoot = 'salt_root_' + Date.now();
    const salt1 = 'salt_' + Date.now() + '_1';
    const salt2 = 'salt_' + Date.now() + '_2';
    const salt3 = 'salt_' + Date.now() + '_3';

    const userBrands = await Promise.all([
      // ROOT user registered in the brand (¡NUEVO!)
      prisma.userBrand.create({
        data: {
          userId: rootUser.id,
          brandId: mainBrand.id,
          passwordHash,
          salt: saltRoot,
        },
      }),
      // Juan registered in the brand
      prisma.userBrand.create({
        data: {
          userId: clientUsers[0].id,
          brandId: mainBrand.id,
          passwordHash,
          salt: salt1,
        },
      }),
      // María registered in the brand
      prisma.userBrand.create({
        data: {
          userId: clientUsers[1].id,
          brandId: mainBrand.id,
          passwordHash,
          salt: salt2,
        },
      }),
      // Admin also registered in the brand
      prisma.userBrand.create({
        data: {
          userId: adminUsers[0].id,
          brandId: mainBrand.id,
          passwordHash,
          salt: salt3,
        },
      }),
    ]);

    console.log('✅ Created user-brand relationships:');
    userBrands.forEach((ub, index) => {
      const userType = index === 0 ? 'ROOT' : index === 3 ? 'ADMIN' : 'CLIENT';
      console.log(`   - ${userType} User ${ub.userId} → Brand ${ub.brandId}`);
    });

    console.log('\n📋 Test data summary:');
    console.log(`🏢 Brand: ${mainBrand.name} (ID: ${mainBrand.id})`);
    console.log(`   📍 ${mainBrand.address}`);
    console.log(`   📞 ${mainBrand.phone}`);

    console.log('\n👥 Test users (all with password: "password123"):');
    console.log(`   - ROOT: ${rootUser.username} (${rootUser.email})`);
    clientUsers.forEach((user) => {
      console.log(
        `   - CLIENT: ${user.username} (${user.firstName} ${user.lastName})`,
      );
    });
    adminUsers.forEach((user) => {
      console.log(
        `   - ADMIN: ${user.username} (${user.firstName} ${user.lastName})`,
      );
    });

    console.log(
      '\n🔐 All users can login with email and password "password123"',
    );
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
}

// If run directly
if (require.main === module) {
  seedUsers()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
