import React from 'react';
import { requireAdmin } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { RoundControlClient } from '@/components/admin/RoundControlClient';

export const metadata = {
  title: 'Round Control | Admin',
};

export default async function AdminControlsPage() {
  await requireAdmin();

  const settings = await prisma.roundSettings.findUnique({
    where: { id: 'singleton' }
  });

  const teams = await prisma.team.findMany({
    where: { qualified: true },
    orderBy: { name: 'asc' },
    include: {
      examSession: {
        select: {
          id: true,
          submitted: true,
          score: true,
        }
      }
    }
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Round Control</h1>
        <p className="text-gray-500 mt-1">Manage global exam settings and monitor live team progress.</p>
      </div>

      <RoundControlClient settings={settings} teams={teams} />
    </div>
  );
}
