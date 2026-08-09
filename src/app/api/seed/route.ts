import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    await prisma.team.upsert({
      where: { name: 'Test Team' },
      update: {},
      create: { name: 'Test Team', qualified: true, backupCode: 'TEST-1234', email: 'test@example.com' }
    });
    
    await prisma.roundSettings.upsert({
      where: { id: 'singleton' },
      update: { roundStatus: 'not_started', questionsPerTeam: 2, timePerQuestionSec: 60 },
      create: { id: 'singleton', roundStatus: 'not_started', questionsPerTeam: 2, timePerQuestionSec: 60 }
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

    return NextResponse.json({ success: true, message: 'Database seeded! You can now log in.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
