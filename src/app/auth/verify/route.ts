import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { setTeamSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const rawToken = searchParams.get('token');
  const email = searchParams.get('email');

  if (!rawToken || !email) {
    return NextResponse.json({ error: 'Missing token or email' }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();
  
  // Find team by email
  const team = await prisma.team.findFirst({
    where: { email: normalizedEmail },
  });

  if (!team || !team.magicToken || !team.magicTokenExpiresAt) {
    return NextResponse.json({ error: 'Invalid or expired login link' }, { status: 400 });
  }

  // Verify expiration
  if (team.magicTokenExpiresAt < new Date()) {
    return NextResponse.json({ error: 'Login link has expired. Please request a new one.' }, { status: 400 });
  }

  // Hash the incoming raw token to compare with stored hash
  const incomingTokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  if (team.magicToken !== incomingTokenHash) {
    return NextResponse.json({ error: 'Invalid login link' }, { status: 400 });
  }

  // Valid token! Consume it so it can't be reused, update loggedInAt
  await prisma.team.update({
    where: { id: team.id },
    data: {
      magicToken: null,
      magicTokenExpiresAt: null,
      loggedInAt: new Date(),
    },
  });

  // Issue session
  await setTeamSession({ teamId: team.id, name: team.name });

  // Redirect to the exam dashboard
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  return NextResponse.redirect(`${baseUrl}/exam`);
}
