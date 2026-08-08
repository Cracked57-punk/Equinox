const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial data...');

  // Create initial Tier 3 Event Admin
  const adminEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin@enigma.club';
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'password123';
  
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: 'Super Admin',
      email: adminEmail,
      passwordHash,
      tier: 3, // Event Admin tier
    },
  });

  console.log('Created initial Tier 3 Admin:', admin.email);

  // Initialize singleton RoundSettings if it doesn't exist
  const settings = await prisma.roundSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      questionsPerTeam: 10,
      timePerQuestionSec: 90,
      startGate: 'manual',
      roundStatus: 'not_started',
    },
  });

  console.log('Initialized Round Settings (questionsPerTeam:', settings.questionsPerTeam, ')');

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
