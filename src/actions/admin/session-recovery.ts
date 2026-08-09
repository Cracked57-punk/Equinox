'use server';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/session';

export async function recoverTeamSession(teamId: string) {
  // Ensure only Tier 3 Event Admins can trigger a recovery
  await requireAdmin(3);

  const session = await prisma.examSession.findUnique({
    where: { teamId },
    include: {
      answers: true,
    }
  });

  if (!session) {
    return { success: false, error: 'Exam session not found for this team.' };
  }

  const settings = await prisma.roundSettings.findUnique({
    where: { id: 'singleton' }
  });

  if (!settings) {
    return { success: false, error: 'Round settings not found.' };
  }

  // Count how many questions the team actually touched (answered, or marked for review)
  // We do not penalize them for just looking at a question (not_answered)
  const answeredCount = session.answers.filter(
    a => a.selected !== null || a.status === 'marked_for_review' || a.status === 'answered_marked'
  ).length;

  // Calculate new time: 
  // Base total time = questionsPerTeam * timePerQuestionSec
  const baseTotalTimeSec = settings.questionsPerTeam * settings.timePerQuestionSec;
  
  // The user explicitly requested: "1 min per question that will be subtracted from the totaltimegiven"
  const PENALTY_PER_ANSWER_SEC = 60; // 1 minute per answered question
  const timeDeductionSec = answeredCount * PENALTY_PER_ANSWER_SEC;

  // Calculate remaining time, bounding it to a minimum of 0
  let newRemainingTimeSec = baseTotalTimeSec - timeDeductionSec;
  if (newRemainingTimeSec < 0) {
    newRemainingTimeSec = 0;
  }

  const newEndsAt = new Date(Date.now() + (newRemainingTimeSec * 1000));

  // Restart the session with the new endsAt
  await prisma.examSession.update({
    where: { id: session.id },
    data: {
      endsAt: newEndsAt,
      submitted: false,
      autoSubmitted: false,
    }
  });

  return { 
    success: true, 
    message: `Recovered session. Deducted ${timeDeductionSec / 60} minutes for ${answeredCount} answered questions. New remaining time: ${newRemainingTimeSec / 60} minutes.` 
  };
}
