import { PrismaClient } from '../../../generated/prisma';
import { seedBusinessTypes } from './01-business-types';
import { seedFeatures } from './02-features';
import { seedPlans } from './03-plans';
import { seedUsers } from './04-users';
import { seedAppointmentSettings } from './05-appointment-settings';
import { seedBusinessHours } from './06-business-hours';

const prisma = new PrismaClient();

async function runAllSeeds() {
  console.log('🌱 Starting complete database seed...\n');

  try {
    // Run all seeds in order
    await seedBusinessTypes();
    console.log('');
    
    await seedFeatures();
    console.log('');
    
    await seedPlans();
    console.log('');
    
    await seedUsers();
    console.log('');
  
    await seedAppointmentSettings();
    console.log('');

    await seedBusinessHours();
    console.log('');

    console.log('🎉 All seeds completed successfully!');
    console.log('\n🧪 Example API test:');
    console.log('POST /auth/register/client');
    console.log('Body:');
    console.log(JSON.stringify({
      email: 'nuevo@gmail.com',
      username: 'nuevo_usuario',
      password: 'password123',
      firstName: 'Nuevo',
      lastName: 'Usuario',
      branchId: 1 // Use the created brand ID
    }, null, 2));

  } catch (error) {
    console.error('❌ Seed process failed:', error);
    throw error;
  }
}

// Main execution
if (require.main === module) {
  runAllSeeds()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export default runAllSeeds;
