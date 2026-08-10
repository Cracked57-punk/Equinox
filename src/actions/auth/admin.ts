'use server';

import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { sendAdminPasswordResetEmail } from '@/lib/email';
import { setAdminSession, clearSession } from '@/lib/auth/session';
import { generateSecureToken, hashToken } from '@/lib/auth/tokens';
import { redirect } from 'next/navigation';

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
  });

  redirect('/admin/dashboard');
}

export async function requestAdminPasswordReset(email: string) {
  if (!email || typeof email !== 'string') {
    return { success: false, error: 'Valid email is required.' };
  }

  const normalizedEmail = email.trim().toLowerCase();

  const admin = await prisma.adminUser.findUnique({
    where: { email: normalizedEmail },
  });

  if (!admin) {
    return { success: true };
  }

  const { rawToken, tokenHash } = generateSecureToken();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  await prisma.adminUser.update({
    where: { id: admin.id },
    data: {
      resetTokenHash: tokenHash,
      resetTokenExpiresAt: expiresAt,
    },
  });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const resetUrl = `${baseUrl}/admin/reset?token=${rawToken}&email=${encodeURIComponent(normalizedEmail)}`;

  const emailResult = await sendAdminPasswordResetEmail({
    to: normalizedEmail,
    adminName: admin.name,
    resetUrl: resetUrl,
  });

  if (!emailResult.success) {
    return { success: false, error: 'Failed to send reset email.' };
  }

  return { success: true };
}

export async function resetAdminPassword(token: string, email: string, newPassword: string) {
  if (!token || !email || !newPassword) {
    return { success: false, error: 'Missing required fields.' };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const tokenHash = hashToken(token);

  const admin = await prisma.adminUser.findUnique({
    where: { email: normalizedEmail },
  });

  if (!admin || !admin.resetTokenHash || !admin.resetTokenExpiresAt) {
    return { success: false, error: 'Invalid or expired reset token.' };
  }

  if (admin.resetTokenHash !== tokenHash || admin.resetTokenExpiresAt < new Date()) {
    return { success: false, error: 'Invalid or expired reset token.' };
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 10);

  await prisma.adminUser.update({
    where: { id: admin.id },
    data: {
      passwordHash: newPasswordHash,
      resetTokenHash: null,
      resetTokenExpiresAt: null,
    },
  });

  return { success: true };
}

export async function logoutAdmin() {
  await clearSession();
  redirect('/admin/login');
}
