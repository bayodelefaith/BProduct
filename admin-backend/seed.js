import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding database...');

  const adminUsers = [
    {
      email: 'admin@example.com',
      name: 'Admin',
      password: 'admin123',
    },
    {
      email: 'berithajao@gmail.com',
      name: 'Berith Admin',
      password: 'admin123',
    },
  ];

  for (const adminData of adminUsers) {
    const existing = await prisma.admin.findUnique({
      where: { email: adminData.email },
    });

    if (!existing) {
      const hashed_password = bcryptjs.hashSync(adminData.password, 10);
      await prisma.admin.create({
        data: {
          email: adminData.email,
          name: adminData.name,
          hashed_password,
        },
      });
      console.log(`✅ Created admin: ${adminData.email}`);
    } else {
      console.log(`ℹ️  Admin already exists: ${adminData.email}`);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📋 Admin Credentials:');
  console.log('='.repeat(50));
  for (const adminData of adminUsers) {
    console.log(`\nEmail: ${adminData.email}`);
    console.log(`Password: ${adminData.password}`);
  }
  console.log('='.repeat(50));

  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error('❌ Seeding error:', e);
  process.exit(1);
});
