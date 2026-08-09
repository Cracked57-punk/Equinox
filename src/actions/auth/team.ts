'use server';

import { prisma } from '@/lib/prisma';
import { sendMagicLinkEmail } from '@/lib/email';
import { setTeamSession } from '@/lib/auth/session';
import { normalizeBackupCode } from '@/lib/auth/backup-code';
import { generateSecureToken } from '@/lib/auth/tokens';
import { redirect } from 'next/navigation';

export async function requestMagicLink(email: string) {
  if (!email || typeof email !== 'string') {
    return { success: false, error: 'Valid email is required.' };
  }

  const normalizedEmail = email.trim().toLowerCase();

  const team = await prisma.team.findFirst({
    where: { email: normalizedEmail },
  });

  if (!team) {
    return { success: false, error: 'No team found with this email address.' };
  }

  const { rawToken, tokenHash } = generateSecureToken();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.team.update({
    where: { id: team.id },
    data: {
      magicToken: tokenHash,
      magicTokenExpiresAt: expiresAt,
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const magicLinkUrl = `${baseUrl}/api/auth/verify?token=${rawToken}&email=${encodeURIComponent(normalizedEmail)}`;

  const emailResult = await sendMagicLinkEmail({
    to: normalizedEmail,
    teamName: team.name,
    magicLinkUrl,
  });

  if (!emailResult.success) {
    return { success: false, error: 'Failed to send login email. Please try again or ask an admin for a backup code.' };
  }

  return { success: true };
}

export async function loginWithBackupCode(code: string) {
  if (!code || typeof code !== 'string') {
    return { success: false, error: 'Backup code is required.' };
  }

  const normalizedCode = normalizeBackupCode(code);

  const team = await prisma.team.findUnique({
    where: { backupCode: normalizedCode },
  });

  if (!team) {
    return { success: false, error: 'Invalid backup code.' };
  }

  await prisma.team.update({
    where: { id: team.id },
    data: { loggedInAt: new Date() },
  });

  await setTeamSession({ teamId: team.id, name: team.name });

  redirect('/exam');
}
