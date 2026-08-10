import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth/session';
import QualifiersChecklist from '@/components/admin/QualifiersChecklist';

export const metadata = {
  title: 'Team Qualifiers - Equinox Admin',
};

export default async function AdminQualifiersPage() {
  // Enforce admin access server-side before rendering
  await requireAdmin();

  const settings = await prisma.roundSettings.findUnique({
    where: { id: 'singleton' },
  });
  
  const roundStarted = settings?.roundStatus !== 'not_started';

  let teams = await prisma.team.findMany({
    orderBy: [
      { qualified: 'desc' },
      { name: 'asc' },
    ],
  });

  // If the round has started, hide unqualified teams from the UI entirely
  if (roundStarted) {
    teams = teams.filter((t) => t.qualified);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Round 1 → 2 Qualifiers</h1>
        <p className="text-gray-500 mt-1">Review and lock in the teams advancing to Round 2.</p>
        {roundStarted && (
          <p className="text-sm font-medium text-amber-600 mt-2">
            The round has started. Only qualified teams are shown.
          </p>
        )}
      </div>

      <QualifiersChecklist initialTeams={teams} />
    </div>
  );
}
