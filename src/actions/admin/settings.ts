'use server';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/session';
import { revalidatePath } from 'next/cache';

export async function updateRoundSettings(questionsPerTeam: number, timePerQuestionSec: number) {
  await requireAdmin();

  try {
    const settings = await prisma.roundSettings.findUnique({
      where: { id: 'singleton' }
    });

    if (settings?.roundStatus !== 'not_started') {
      return { success: false, error: 'Cannot change settings after the round has started.' };
    }

    await prisma.roundSettings.update({
      where: { id: 'singleton' },
      data: {
        questionsPerTeam,
        timePerQuestionSec,
      }
    });

    revalidatePath('/admin/controls');
    return { success: true, message: 'Settings updated successfully.' };
  } catch (error: any) {
    console.error('Failed to update round settings:', error);
    return { success: false, error: 'Failed to update round settings.' };
  }
}
