'use client';

import { useState, useTransition } from 'react';
import { updateRoundSettings } from '@/actions/admin/settings';
import { startRound, endRound } from '@/actions/admin/round-control';
import { recoverTeamSession } from '@/actions/admin/session-recovery';
import { useRouter } from 'next/navigation';

export function RoundControlClient({ settings, teams }: { settings: any, teams: any[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [qCount, setQCount] = useState(settings?.questionsPerTeam || 10);
  const [timeSec, setTimeSec] = useState(settings?.timePerQuestionSec || 90);
  const [message, setMessage] = useState('');

  const handleUpdateSettings = async () => {
    startTransition(async () => {
      const res = await updateRoundSettings(Number(qCount), Number(timeSec));
      setMessage(res.error || res.message || '');
      router.refresh();
    });
  };

  const handleStartRound = async () => {
    if (!confirm('Are you sure you want to START the round for all teams?')) return;
    startTransition(async () => {
      const res = await startRound();
      setMessage(res.error || res.message || '');
      router.refresh();
    });
  };

  const handleEndRound = async () => {
    if (!confirm('Are you sure you want to END the round? This stops all active exams.')) return;
    startTransition(async () => {
      const res = await endRound();
      setMessage(res.error || res.message || '');
      router.refresh();
    });
  };

  const handleRecover = async (teamId: string) => {
    if (!confirm('Are you sure you want to trigger session recovery for this team?')) return;
    startTransition(async () => {
      const res = await recoverTeamSession(teamId);
      setMessage(res.error || res.message || '');
      router.refresh();
    });
  };

  const status = settings?.roundStatus || 'not_started';

  return (
    <div className="space-y-8">
      {message && (
        <div className="p-4 bg-indigo-50 text-indigo-700 rounded-md border border-indigo-200">
          {message}
        </div>
      )}

      {/* Settings Panel */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <h2 className="text-xl font-bold mb-4">Round Settings</h2>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Questions Per Team</label>
            <input 
              type="number" 
              value={qCount} 
              onChange={e => setQCount(e.target.value)}
              disabled={status !== 'not_started'}
              className="border p-2 rounded-md w-32"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Per Question (sec)</label>
            <input 
              type="number" 
              value={timeSec} 
              onChange={e => setTimeSec(e.target.value)}
              disabled={status !== 'not_started'}
              className="border p-2 rounded-md w-32"
            />
          </div>
          <button 
            onClick={handleUpdateSettings}
            disabled={status !== 'not_started' || isPending}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:opacity-50"
          >
            Save Settings
          </button>
        </div>
        {status !== 'not_started' && (
          <p className="text-sm text-amber-600 mt-2">Settings cannot be changed once the round has started.</p>
        )}
      </div>

      {/* Round Control Panel */}
      <div className="bg-white p-6 rounded-lg border shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold mb-1">Round Status: <span className="uppercase text-indigo-600">{status.replace('_', ' ')}</span></h2>
          <p className="text-gray-500 text-sm">Control the global state of the exam.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleStartRound}
            disabled={status !== 'not_started' || isPending}
            className="px-6 py-2 bg-green-600 text-white font-bold rounded-md disabled:opacity-50"
          >
            START ROUND
          </button>
          <button 
            onClick={handleEndRound}
            disabled={status === 'ended' || isPending}
            className="px-6 py-2 bg-red-600 text-white font-bold rounded-md disabled:opacity-50"
          >
            END ROUND
          </button>
        </div>
      </div>

      {/* Live Teams Dashboard */}
      <div className="bg-white p-6 rounded-lg border shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Live Team Status</h2>
          <button onClick={() => router.refresh()} className="text-indigo-600 text-sm hover:underline">
            Refresh Data
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-3 font-semibold text-gray-600">Team</th>
                <th className="p-3 font-semibold text-gray-600">Login Status</th>
                <th className="p-3 font-semibold text-gray-600">Exam Status</th>
                <th className="p-3 font-semibold text-gray-600">Score</th>
                <th className="p-3 font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => {
                const isOnline = !!team.loggedInAt; // Basic check, could be improved with real activity tracking
                const session = team.examSession;
                
                let examStatus = 'Not Started';
                if (session) {
                  if (session.submitted) examStatus = 'Submitted';
                  else examStatus = 'In Progress';
                }

                return (
                  <tr key={team.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{team.name}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${isOnline ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                        {isOnline ? 'Logged In' : 'Offline'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        examStatus === 'Submitted' ? 'bg-blue-100 text-blue-700' : 
                        examStatus === 'In Progress' ? 'bg-amber-100 text-amber-700' : 
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {examStatus}
                      </span>
                    </td>
                    <td className="p-3 font-mono">
                      {session?.submitted ? session.score : '-'}
                    </td>
                    <td className="p-3 text-right">
                      {examStatus === 'In Progress' && (
                        <button 
                          onClick={() => handleRecover(team.id)}
                          disabled={isPending}
                          className="text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-1.5 rounded transition-colors"
                        >
                          Recover Session
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {teams.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No qualified teams found. Please run the Round 1 handoff first.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
