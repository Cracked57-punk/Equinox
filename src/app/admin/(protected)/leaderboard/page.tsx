import React from 'react';
import { requireAdmin } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { LeaderboardRefresh } from '@/components/admin/LeaderboardRefresh';
import { LiveRefresh } from '@/components/shared/LiveRefresh';

export const metadata = {
  title: 'Leaderboard | Admin',
};

// Next.js dynamic rendering - ensure it doesn't cache stale scores
export const dynamic = 'force-dynamic';

export default async function LeaderboardPage() {
  await requireAdmin();

  const sessions = await prisma.examSession.findMany({
    where: { submitted: true },
    include: {
      team: {
        select: { name: true }
      }
    }
  });

  // Calculate duration and sort
  const ranked = sessions.map(session => {
    let durationSec = 0;
    if (session.startedAt && session.submittedAt) {
      durationSec = Math.floor((session.submittedAt.getTime() - session.startedAt.getTime()) / 1000);
    }
    return {
      ...session,
      teamName: session.team.name,
      durationSec
    };
  }).sort((a, b) => {
    // 1st Priority: Score (Descending)
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    // 2nd Priority: Duration (Ascending - faster is better)
    return a.durationSec - b.durationSec;
  });

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <LiveRefresh intervalMs={5000} />
      
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Live Leaderboard</h1>
          <p className="text-gray-500 mt-1">Round 2 Scores (Ties broken by less time taken)</p>
        </div>
        <LeaderboardRefresh />
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-indigo-900 text-white">
              <th className="p-4 font-semibold text-center w-20">Rank</th>
              <th className="p-4 font-semibold">Team Name</th>
              <th className="p-4 font-semibold text-right">Score</th>
              <th className="p-4 font-semibold text-right">Time Taken</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((session, index) => (
              <tr 
                key={session.id} 
                className={`border-b hover:bg-indigo-50/50 transition-colors ${
                  index === 0 ? 'bg-amber-50/30 font-medium' : 
                  index === 1 ? 'bg-gray-50/50 font-medium' : 
                  index === 2 ? 'bg-orange-50/30 font-medium' : ''
                }`}
              >
                <td className="p-4 text-center">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                </td>
                <td className="p-4 text-gray-900 font-bold text-lg">{session.teamName}</td>
                <td className="p-4 text-right text-indigo-600 font-bold text-xl">{session.score}</td>
                <td className="p-4 text-right text-gray-500 font-mono">
                  {formatTime(session.durationSec)}
                </td>
              </tr>
            ))}
            {ranked.length === 0 && (
              <tr>
                <td colSpan={4} className="p-12 text-center text-gray-500 text-lg">
                  No exams submitted yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
