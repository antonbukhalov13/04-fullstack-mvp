import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.adminUser.upsert({
    where: { login: 'admin' },
    update: {},
    create: {
      login: 'admin',
      passwordHash: adminPasswordHash,
      role: 'admin',
    },
  });

  // Create operator user
  const operatorPasswordHash = await bcrypt.hash('operator123', 10);
  const operator = await prisma.adminUser.upsert({
    where: { login: 'operator' },
    update: {},
    create: {
      login: 'operator',
      passwordHash: operatorPasswordHash,
      role: 'operator',
    },
  });

  console.log('Seed completed!');
  console.log('');
  console.log('Test admin credentials:');
  console.log('  Login: admin');
  console.log('  Password: admin123');
  console.log('  Role: admin');
  console.log('');
  console.log('Test operator credentials:');
  console.log('  Login: operator');
  console.log('  Password: operator123');
  console.log('  Role: operator');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
