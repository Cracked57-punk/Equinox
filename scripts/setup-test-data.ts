import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Insert dummy team
  const team = await prisma.team.upsert({
    where: { name: 'Test Team 1' },
    update: {},
    create: {
      name: 'Test Team 1',
      email: 'team1@example.com',
      qualified: true,
      backupCode: 'TEST-1234',
    }
  });
  console.log('Created team:', team);

  // Insert RoundSettings
  const settings = await prisma.roundSettings.upsert({
    where: { id: 'singleton' },
    update: {
      roundStatus: 'in_progress',
      questionsPerTeam: 3,
      timePerQuestionSec: 60,
    },
    create: {
      id: 'singleton',
      roundStatus: 'in_progress',
      questionsPerTeam: 3,
      timePerQuestionSec: 60,
    }
  });
  console.log('Created settings:', settings);

  // Insert a few questions
  for (let i = 1; i <= 5; i++) {
    await prisma.question.create({
      data: {
        text: `This is test question ${i}?`,
        optionA: `Option A for ${i}`,
        optionB: `Option B for ${i}`,
        optionC: `Option C for ${i}`,
        optionD: `Option D for ${i}`,
        correctAnswer: 'A',
      }
    });
  }
  console.log('Created 5 questions');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
