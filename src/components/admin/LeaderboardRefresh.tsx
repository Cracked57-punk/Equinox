'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

export function LeaderboardRefresh() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <button 
      onClick={handleRefresh}
      disabled={isPending}
      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
    >
      {isPending ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Refreshing...
        </>
      ) : (
        'Refresh Scores'
      )}
    </button>
  );
}
