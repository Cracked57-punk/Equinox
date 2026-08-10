import React from 'react';
import { requireTeam } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { LiveRefresh } from '@/components/shared/LiveRefresh';
import Link from 'next/link';

export const metadata = {
  title: 'Live Leaderboard | Equinox',
};

export const dynamic = 'force-dynamic';

export default async function PublicLeaderboardPage() {
  const team = await requireTeam();

  // Ensure they have actually submitted before showing them this
  const mySession = await prisma.examSession.findUnique({
    where: { teamId: team.id }
  });

  if (!mySession?.submitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-black text-white text-center">
        <h1 className="text-3xl font-bold text-red-500 mb-4">Access Denied</h1>
        <p className="text-gray-400 mb-6">You cannot view the leaderboard until you have submitted your exam.</p>
        <Link href="/exam" className="text-indigo-400 hover:underline">Return to Exam</Link>
      </div>
    );
  }

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
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.durationSec - b.durationSec;
  });

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 font-sans selection:bg-indigo-500/30">
      <LiveRefresh intervalMs={5000} />
      
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10 mt-8">
          <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-sm font-medium border border-indigo-500/20 mb-4 animate-pulse">
            🔴 LIVE
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">Round 2 Leaderboard</h1>
          <p className="text-gray-400 text-lg">Waiting for all teams to finish...</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-950 border-b border-gray-800 text-gray-400 text-sm">
                <th className="p-4 font-semibold text-center w-20">Rank</th>
                <th className="p-4 font-semibold">Team Name</th>
                <th className="p-4 font-semibold text-right">Score</th>
                <th className="p-4 font-semibold text-right">Time Taken</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {ranked.map((session, index) => {
                const isMe = session.teamId === team.id;
                return (
                  <tr 
                    key={session.id} 
                    className={`transition-colors hover:bg-gray-800/50 ${
                      isMe ? 'bg-indigo-900/20' : ''
                    } ${
                      index === 0 ? 'bg-amber-500/10' : 
                      index === 1 ? 'bg-gray-300/10' : 
                      index === 2 ? 'bg-orange-600/10' : ''
                    }`}
                  >
                    <td className="p-4 text-center text-lg">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : <span className="text-gray-500 font-mono">{index + 1}</span>}
                    </td>
                    <td className="p-4">
                      <span className={`font-bold text-lg ${isMe ? 'text-indigo-400' : 'text-gray-200'}`}>
                        {session.teamName}
                      </span>
                      {isMe && <span className="ml-2 text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">You</span>}
                    </td>
                    <td className="p-4 text-right">
                      <span className={`font-bold text-xl ${index < 3 ? 'text-white' : 'text-indigo-300'}`}>
                        {session.score}
                      </span>
                    </td>
                    <td className="p-4 text-right text-gray-500 font-mono text-sm">
                      {formatTime(session.durationSec)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
