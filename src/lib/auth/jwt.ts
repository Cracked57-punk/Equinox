import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'equinox-secret-key-change-in-production';
const encodedKey = new TextEncoder().encode(JWT_SECRET);

import { TeamJwtPayload, AdminJwtPayload } from '@/types/auth';

/**
 * Signs a JWT token for a team session. Default expiration: 12 hours.
 */
export async function signTeamToken(
  payload: Omit<TeamJwtPayload, 'type'>,
  expiresIn: string = '12h'
): Promise<string> {
  return new SignJWT({ ...payload, type: 'team' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(encodedKey);
}

/**
 * Verifies and decodes a team JWT token.
 */
export async function verifyTeamToken(token: string): Promise<TeamJwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ['HS256'],
    });

    if (payload.type !== 'team' || typeof payload.teamId !== 'string') {
      return null;
    }

    return payload as unknown as TeamJwtPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Signs a JWT token for an admin session. Default expiration: 24 hours.
 */
export async function signAdminToken(
  payload: Omit<AdminJwtPayload, 'type'>,
  expiresIn: string = '24h'
): Promise<string> {
  return new SignJWT({ ...payload, type: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(encodedKey);
}

/**
 * Verifies and decodes an admin JWT token.
 */
export async function verifyAdminToken(token: string): Promise<AdminJwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ['HS256'],
    });

    if (payload.type !== 'admin' || typeof payload.adminId !== 'string') {
      return null;
    }

    return payload as unknown as AdminJwtPayload;
  } catch (error) {
    return null;
  }
}
