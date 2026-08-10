'use server';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/session';
import { revalidatePath } from 'next/cache';

export async function saveQualifiers(teamIds: string[]) {
  // Enforce admin access
  await requireAdmin();

  if (!Array.isArray(teamIds)) {
    return { success: false, error: 'Invalid input' };
  }

  // Update teams in a transaction to ensure consistency
  try {
    await prisma.$transaction(async (tx) => {
      // 1. Reset all teams to not qualified
      await tx.team.updateMany({
        data: { qualified: false },
      });

      // 2. Set the selected teams to qualified
      if (teamIds.length > 0) {
        await tx.team.updateMany({
          where: {
            id: { in: teamIds },
          },
          data: { qualified: true },
        });
      }
    });

    revalidatePath('/admin/qualifiers');
    return { success: true };
  } catch (error) {
    console.error('Error saving qualifiers:', error);
    return { success: false, error: 'Failed to save qualifiers' };
  }
}
