'use server';

import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { sendMagicLinkEmail } from '@/lib/email';
import { setTeamSession, setAdminSession, clearSession } from '@/lib/auth';
import { normalizeBackupCode } from '@/lib/backup-code';
import { redirect } from 'next/navigation';

export async function requestMagicLink(email: string) {
  if (!email || typeof email !== 'string') {
    return { success: false, error: 'Valid email is required.' };
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Find team by email
  const team = await prisma.team.findFirst({
    where: { email: normalizedEmail },
  });

  if (!team) {
    // Return error for UX
    return { success: false, error: 'No team found with this email address.' };
  }

  // Generate cryptographically secure token
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  // Token expires in 15 minutes
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.team.update({
    where: { id: team.id },
    data: {
      magicToken: tokenHash,
      magicTokenExpiresAt: expiresAt,
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const magicLinkUrl = `${baseUrl}/auth/verify?token=${rawToken}&email=${encodeURIComponent(normalizedEmail)}`;

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

  // Update logged in time
  await prisma.team.update({
    where: { id: team.id },
    data: { loggedInAt: new Date() },
  });

  // Issue session
  await setTeamSession({ teamId: team.id, name: team.name });

  redirect('/exam');
}

export async function loginAdmin(email: string, password: string) {
  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' };
  }

  const admin = await prisma.adminUser.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  if (!admin) {
    return { success: false, error: 'Invalid email or password.' };
  }

  const passwordMatch = await bcrypt.compare(password, admin.passwordHash);

  if (!passwordMatch) {
    return { success: false, error: 'Invalid email or password.' };
  }

  await setAdminSession({
    adminId: admin.id,
    name: admin.name,
    email: admin.email,
    tier: admin.tier,
  });

  redirect('/admin');
}

export async function logout() {
  await clearSession();
  redirect('/login');
}
