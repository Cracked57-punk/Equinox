'use client';

import { useEffect, useState } from 'react';
import { initializeExamSession } from '@/actions/exam';

export function ClientStartExam() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const res = await initializeExamSession();
        if (res.success) {
          if (mounted) window.location.reload();
        } else {
          if (mounted) setError(res.error || 'Failed to initialize exam session.');
        }
      } catch (err) {
        if (mounted) setError('An unexpected error occurred while starting the exam.');
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-black text-white">
      {error ? (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-2">Error</h1>
          <p className="text-gray-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md font-medium"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="text-center flex flex-col items-center">
          <h1 className="text-2xl font-bold mb-4">Generating your exam paper...</h1>
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}
