const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding initial data...');

  const adminEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin@enigma.club';
  const rawPassword = process.env.INITIAL_ADMIN_PASSWORD;

  if (!rawPassword) {
    throw new Error('INITIAL_ADMIN_PASSWORD is not set in .env — seed cannot create the initial admin without it');
  }

  const passwordHash = await bcrypt.hash(rawPassword, 10);

  const admin = await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
    },
    create: {
      name: 'Super Admin',
      email: adminEmail,
      passwordHash,
    },
  });

  console.log('Created initial Admin:', admin.email);

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
  console.log('Seeding 35 teams...');
  const teamsData = Array.from({ length: 35 }).map((_, i) => ({
    name: `Team ${i + 1}`,
    email: `team${i + 1}@enigma.club`,
    qualified: false,
  }));

  for (const team of teamsData) {
    await prisma.team.upsert({
      where: { name: team.name },
      update: {},
      create: team,
    });
  }

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