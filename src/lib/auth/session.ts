import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import {
  signTeamToken,
  verifyTeamToken,
  signAdminToken,
  verifyAdminToken,
} from '@/lib/auth/jwt';
import { TeamJwtPayload, AdminJwtPayload } from '@/types/auth';

const TEAM_COOKIE_NAME = 'equinox_team_session';
const ADMIN_COOKIE_NAME = 'equinox_admin_session';

const isProduction = process.env.NODE_ENV === 'production';

// Cookie options for security
const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'lax' as const,
  path: '/',
};

export async function setTeamSession(payload: Omit<TeamJwtPayload, 'type'>) {
  const token = await signTeamToken(payload, '12h');
  const cookieStore = await cookies();
  cookieStore.set(TEAM_COOKIE_NAME, token, {
    ...cookieOptions,
    maxAge: 12 * 60 * 60, // 12 hours
  });
}

export async function setAdminSession(payload: Omit<AdminJwtPayload, 'type'>) {
  const token = await signAdminToken(payload, '24h');
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    ...cookieOptions,
    maxAge: 24 * 60 * 60, // 24 hours
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(TEAM_COOKIE_NAME);
  cookieStore.delete(ADMIN_COOKIE_NAME);
}

/**
 * Validates the current team session.
 * Redirects to /login if invalid or missing.
 */
export async function requireTeam() {
  const cookieStore = await cookies();
  const token = cookieStore.get(TEAM_COOKIE_NAME)?.value;

  if (!token) {
    redirect('/login');
  }

  const payload = await verifyTeamToken(token);
  if (!payload) {
    redirect('/login');
  }

  // Verify the team still exists in the database
  const team = await prisma.team.findUnique({
    where: { id: payload.teamId },
    select: { id: true, name: true, qualified: true },
  });

  if (!team) {
    redirect('/login');
  }

  return team;
}

/**
 * Validates the current admin session and ensures minimum tier requirement.
 * Redirects to /admin/login if missing/invalid.
 * Redirects to /admin/access-denied if the authenticated admin does not meet minTier.
 */
export async function requireAdmin(minTier?: number) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!token) {
    redirect('/admin/login');
  }

  const payload = await verifyAdminToken(token);
  if (!payload) {
    redirect('/admin/login');
  }

  if (minTier !== undefined && payload.tier < minTier) {
    redirect('/admin/access-denied');
  }

  return payload;
}
