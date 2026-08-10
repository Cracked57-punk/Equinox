'use server';

import { prisma } from '@/lib/prisma';
import { requireTeam } from '@/lib/auth/session';

export async function getExamSession() {
  const team = await requireTeam();
  
  const session = await prisma.examSession.findUnique({
    where: { teamId: team.id },
    include: {
      answers: {
        orderBy: { order: 'asc' },
        include: {
          question: {
            select: {
              id: true,
              text: true,
              optionA: true,
              optionB: true,
              optionC: true,
              optionD: true,
              imageLinks: true,
            }
          }
        }
      }
    }
  });

  return session;
}

export async function initializeExamSession() {
  const team = await requireTeam();

  // Check if session already exists
  const existing = await prisma.examSession.findUnique({
    where: { teamId: team.id }
  });

  if (existing) {
    return { success: true, session: existing };
  }

  // Check if team is qualified
  const teamRecord = await prisma.team.findUnique({
    where: { id: team.id }
  });
  if (!teamRecord || !teamRecord.qualified) {
    return { success: false, error: 'Team is not qualified for this round.' };
  }

  // Get round settings
  const settings = await prisma.roundSettings.findUnique({
    where: { id: 'singleton' }
  });

  if (!settings || settings.roundStatus !== 'in_progress') {
    return { success: false, error: 'Round is not in progress.' };
  }

  // Get active questions
  const allQuestions = await prisma.question.findMany({
    where: { active: true },
    select: { id: true }
  });

  if (allQuestions.length === 0) {
    return { success: false, error: 'No questions available.' };
  }

  // Fisher-Yates shuffle
  const shuffled = [...allQuestions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const selectedQuestions = shuffled.slice(0, settings.questionsPerTeam);

  // Calculate times
  const now = new Date();
  const durationSec = settings.questionsPerTeam * settings.timePerQuestionSec;
  const endsAt = new Date(now.getTime() + durationSec * 1000);

  // Create session and answers
  const session = await prisma.$transaction(async (tx) => {
    const newSession = await tx.examSession.create({
      data: {
        teamId: team.id,
        startedAt: now,
        endsAt: endsAt,
        answers: {
          create: selectedQuestions.map((q, i) => ({
            questionId: q.id,
            order: i + 1,
            status: 'not_visited',
          }))
        }
      },
      include: {
        answers: {
          orderBy: { order: 'asc' }
        }
      }
    });
    return newSession;
  });

  return { success: true, session };
}

export async function syncAnswer(answerId: string, selected: string | null, status: string) {
  const team = await requireTeam();

  const answer = await prisma.teamQuestionAnswer.findUnique({
    where: { id: answerId },
    include: { examSession: true }
  });

  if (!answer || answer.examSession.teamId !== team.id) {
    return { success: false, error: 'Unauthorized' };
  }

  if (answer.examSession.submitted || (answer.examSession.endsAt && answer.examSession.endsAt < new Date())) {
    return { success: false, error: 'Exam already submitted or time expired' };
  }

  await prisma.teamQuestionAnswer.update({
    where: { id: answerId },
    data: {
      selected,
      status,
    }
  });

  return { success: true };
}

export async function submitExam(autoSubmitted = false) {
  const team = await requireTeam();

  const session = await prisma.examSession.findUnique({
    where: { teamId: team.id },
    include: {
      answers: {
        include: {
          question: {
            select: { correctAnswer: true }
          }
        }
      }
    }
  });

  if (!session || session.submitted) {
    return { success: false, error: 'Already submitted or not found' };
  }

  let totalScore = 0;

  await prisma.$transaction(async (tx) => {
    for (const answer of session.answers) {
      let isCorrect = null;
      
      if (answer.selected) {
        isCorrect = answer.selected === answer.question.correctAnswer;
        if (isCorrect) {
          totalScore += 20;
        }
      }

      await tx.teamQuestionAnswer.update({
        where: { id: answer.id },
        data: { isCorrect }
      });
    }

    await tx.examSession.update({
      where: { id: session.id },
      data: {
        submitted: true,
        submittedAt: new Date(),
        autoSubmitted,
        score: totalScore,
      }
    });
  });

  return { success: true };
}
