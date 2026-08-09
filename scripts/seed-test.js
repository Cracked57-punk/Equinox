const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.team.upsert({
    where: { name: 'Test Team' },
    update: {},
    create: { name: 'Test Team', qualified: true, backupCode: 'TEST-1234', email: 'test@example.com' }
  });
  
  await prisma.roundSettings.upsert({
    where: { id: 'singleton' },
    update: { roundStatus: 'in_progress', questionsPerTeam: 2, timePerQuestionSec: 600 },
    create: { id: 'singleton', roundStatus: 'in_progress', questionsPerTeam: 2, timePerQuestionSec: 600 }
  });
  
  const qCount = await prisma.question.count();
  if (qCount === 0) {
    await prisma.question.createMany({
      data: [
        { text: 'What is 2+2?', optionA: '3', optionB: '4', optionC: '5', optionD: '6', correctAnswer: 'B' },
        { text: 'What is the capital of France?', optionA: 'London', optionB: 'Berlin', optionC: 'Paris', optionD: 'Madrid', correctAnswer: 'C' }
      ]
    });
  }
  console.log('Seed successful!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
