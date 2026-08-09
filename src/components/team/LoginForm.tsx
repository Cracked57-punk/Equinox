'use client';

import { useState } from 'react';
import { requestMagicLink, loginWithBackupCode } from '@/actions/auth/team';

export function LoginForm() {
  const [method, setMethod] = useState<'email' | 'backup'>('email');
  const [email, setEmail] = useState('');
  const [backupCode, setBackupCode] = useState('');
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setMessage('');
    
    try {
      const res = await requestMagicLink(email);
      if (res.success) {
        setStatus('success');
        setMessage('Magic link sent! Check your email to log in.');
      } else {
        setStatus('error');
        setMessage(res.error || 'Failed to send magic link.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('An unexpected error occurred.');
    }
  };

  const handleBackupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!backupCode) return;

    setStatus('loading');
    setMessage('');
    
    try {
      const res = await loginWithBackupCode(backupCode);
      if (res && !res.success) {
        setStatus('error');
        setMessage(res.error || 'Invalid backup code.');
      }
      // If successful, the action will redirect
    } catch (err) {
      setStatus('error');
      setMessage('An unexpected error occurred.');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
      <div className="flex gap-2 mb-6 p-1 bg-black/20 rounded-lg">
        <button
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            method === 'email' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
          onClick={() => { setMethod('email'); setStatus('idle'); setMessage(''); }}
        >
          Email Magic Link
        </button>
        <button
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            method === 'backup' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
          onClick={() => { setMethod('backup'); setStatus('idle'); setMessage(''); }}
        >
          Backup Code
        </button>
      </div>

      {method === 'email' ? (
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Registered Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="team@example.com"
              required
              disabled={status === 'loading' || status === 'success'}
            />
          </div>
          
          <button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
          >
            {status === 'loading' ? 'Sending...' : 'Send Magic Link'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleBackupSubmit} className="space-y-4">
          <div>
            <label htmlFor="backupCode" className="block text-sm font-medium text-gray-300 mb-1">
              Backup Code
            </label>
            <input
              id="backupCode"
              type="text"
              value={backupCode}
              onChange={(e) => setBackupCode(e.target.value)}
              className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase tracking-widest"
              placeholder="ABCD-1234"
              required
              disabled={status === 'loading'}
            />
            <p className="mt-2 text-xs text-gray-500">
              Only use this if you cannot access your email.
            </p>
          </div>
          
          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors"
          >
            {status === 'loading' ? 'Verifying...' : 'Login with Code'}
          </button>
        </form>
      )}

      {message && (
        <div className={`mt-4 p-3 rounded-lg text-sm ${
          status === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
          status === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : ''
        }`}>
          {message}
        </div>
      )}
    </div>
  );
}
