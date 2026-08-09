import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    await prisma.roundSettings.update({
      where: { id: 'singleton' },
      data: {
        roundStatus: 'in_progress',
        roundStartedAt: new Date(),
      }
    });

    return NextResponse.json({ success: true, message: 'Round started! Switch back to the team tab to see the exam begin automatically.' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
