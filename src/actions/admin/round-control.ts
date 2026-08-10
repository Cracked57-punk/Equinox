'use server';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/session';

export async function startRound() {
  await requireAdmin();

  try {
    await prisma.roundSettings.update({
      where: { id: 'singleton' },
      data: {
        roundStatus: 'in_progress',
        roundStartedAt: new Date(),
      }
    });

    return { success: true, message: 'Round started successfully.' };
  } catch (error: any) {
    console.error('Failed to start round:', error);
    return { success: false, error: 'Failed to start round.' };
  }
}

export async function endRound() {
  await requireAdmin();

  try {
    await prisma.roundSettings.update({
      where: { id: 'singleton' },
      data: {
        roundStatus: 'ended',
        roundEndsAt: new Date(),
      }
    });

    return { success: true, message: 'Round ended successfully.' };
  } catch (error: any) {
    console.error('Failed to end round:', error);
    return { success: false, error: 'Failed to end round.' };
  }
}
