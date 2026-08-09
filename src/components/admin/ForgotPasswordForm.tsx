'use client';

import { useState } from 'react';
import { requestAdminPasswordReset } from '@/actions/auth/admin';

export default function ForgotPasswordForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;

    try {
      const result = await requestAdminPasswordReset(email);
      if (result.success) {
        setStatus('success');
        setMessage('If that email is registered as an admin, a reset link has been sent.');
      } else {
        setStatus('error');
        setMessage(result.error || 'Something went wrong.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('An unexpected error occurred.');
    }
  };

  if (status === 'success') {
    return (
      <div className="rounded-md bg-green-50 p-4 text-green-700 text-sm">
        {message}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">Email address</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="mt-1 block w-full rounded-md border p-2"
        />
      </div>
      
      {status === 'error' && (
        <div className="text-red-600 text-sm">{message}</div>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full rounded-md bg-black py-2 text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {status === 'loading' ? 'Sending...' : 'Send Reset Link'}
      </button>
    </form>
  );
}
