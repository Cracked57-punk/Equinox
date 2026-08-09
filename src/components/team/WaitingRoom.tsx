'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { logoutTeam } from '@/actions/auth/team';

export function WaitingRoom({ teamName }: { teamName: string }) {
  const router = useRouter();
  const [dots, setDots] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutTeam();
    });
  };

  // Animated dots for waiting text
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Poll for status changes every 5 seconds
  useEffect(() => {
    const pollInterval = setInterval(() => {
      router.refresh();
    }, 5000);
    return () => clearInterval(pollInterval);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-black to-black text-white relative">
      
      {/* Logout Button */}
      <button 
        onClick={handleLogout}
        disabled={isPending}
        className="absolute top-6 right-6 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-md transition-colors border border-white/10 disabled:opacity-50"
      >
        {isPending ? 'Logging out...' : 'Logout'}
      </button>

      <div className="max-w-3xl w-full mt-8">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            Welcome, {teamName}
          </h1>
          <p className="text-xl text-indigo-300">Round 2 is about to begin</p>
        </div>

        {/* Rules Card */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl mb-10">
          <h2 className="text-2xl font-bold mb-6 border-b border-white/10 pb-4 text-indigo-400">
            Rules & Guidelines
          </h2>
          
          <ul className="space-y-6 text-gray-300 text-lg">
            <li className="flex items-start gap-4">
              <div className="mt-1 w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">1</div>
              <p><strong>Scoring:</strong> You will be awarded <span className="text-green-400 font-bold">+20 points</span> for every correct answer. There is <strong>no negative marking</strong>, so attempt every question!</p>
            </li>
            <li className="flex items-start gap-4">
              <div className="mt-1 w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">2</div>
              <p><strong>Navigation:</strong> You can freely move between questions using the Question Palette on the right side of your screen. You do not have to answer them in order.</p>
            </li>
            <li className="flex items-start gap-4">
              <div className="mt-1 w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">3</div>
              <div>
                <p className="mb-2"><strong>Button Actions:</strong></p>
                <ul className="list-disc pl-5 space-y-1 text-base text-gray-400">
                  <li><span className="text-white">Save & Next:</span> Saves your answer and moves forward.</li>
                  <li><span className="text-purple-400">Mark for Review:</span> Flags the question so you remember to look at it later.</li>
                  <li><span className="text-gray-300">Clear Response:</span> Removes your currently selected option.</li>
                </ul>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="mt-1 w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">4</div>
              <p><strong>Timer & Auto-Submit:</strong> There is a pooled countdown timer at the top of the screen. When the timer reaches zero, your exam will be automatically submitted.</p>
            </li>
          </ul>
        </div>

        {/* Waiting Indicator */}
        <div className="flex flex-col items-center justify-center p-8 bg-indigo-600/10 border border-indigo-500/30 rounded-2xl">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <h3 className="text-xl font-bold text-white tracking-wide">
            Waiting for Admin to begin the round{dots}
          </h3>
          <p className="text-indigo-300 mt-2">Please do not refresh this page. The exam will start automatically.</p>
        </div>

      </div>
    </div>
  );
}
