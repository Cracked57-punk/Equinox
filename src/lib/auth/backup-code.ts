import crypto from 'crypto';

// Unambiguous alphanumeric characters (omitting 0, O, 1, I, L)
const UNAMBIGUOUS_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

const COLORS = [
  'BLUE',
  'RED',
  'GOLD',
  'RUBY',
  'JADE',
  'ONYX',
  'NEON',
  'CYAN',
  'TEAL',
  'PINK',
  'ZINC',
  'IRIS',
  'AMBER',
];

/**
 * Generates a short, human-readable backup code formatted as COLOR-XXXX.
 * Example outputs: "BLUE-7X4Q", "RUBY-9K2P".
 * Uses an unambiguous character set to avoid live event typing mistakes.
 */
export function generateBackupCode(): string {
  const randomColor = COLORS[crypto.randomInt(0, COLORS.length)];
  let randomSuffix = '';

  for (let i = 0; i < 4; i++) {
    const randomIndex = crypto.randomInt(0, UNAMBIGUOUS_CHARS.length);
    randomSuffix += UNAMBIGUOUS_CHARS[randomIndex];
  }

  return `${randomColor}-${randomSuffix}`;
}

/**
 * Normalizes user input for backup code comparison by trimming whitespace
 * and converting to uppercase.
 */
export function normalizeBackupCode(code: string): string {
  return code.trim().toUpperCase();
}
