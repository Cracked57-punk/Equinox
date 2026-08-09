import crypto from 'crypto';

/**
 * Generates a random secure token and its SHA-256 hash.
 * Useful for magic links and password reset links.
 */
export function generateSecureToken() {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  return { rawToken, tokenHash };
}

/**
 * Hashes an existing token for database comparison.
 */
export function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}
