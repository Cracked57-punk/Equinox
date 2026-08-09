'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { resetAdminPassword } from '@/actions/auth/admin';

export default function ResetForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    
    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match.');
      return;
    }

    if (!token || !email) {
      setStatus('error');
      setMessage('Missing token or email in URL.');
      return;
    }

    try {
      const result = await resetAdminPassword(token, email, password);
      if (result.success) {
        setStatus('success');
        setMessage('Password reset successfully. Redirecting to login...');
        setTimeout(() => {
          router.push('/admin/login');
        }, 2000);
      } else {
        setStatus('error');
        setMessage(result.error || 'Failed to reset password.');
      }
    } catch (err) {
      setStatus('error');
      setMessage('An unexpected error occurred.');
    }
  };

  return (
    <div className="w-full max-w-md space-y-8 rounded-lg border p-8 shadow-sm">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Reset Password</h2>
        <p className="text-sm text-gray-500 mt-2">Enter your new password.</p>
      </div>

      {status === 'success' ? (
        <div className="rounded-md bg-green-50 p-4 text-green-700 text-sm text-center">
          {message}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium">New Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={8}
                className="mt-1 block w-full rounded-md border p-2"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium">Confirm New Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={8}
                className="mt-1 block w-full rounded-md border p-2"
              />
            </div>
          </div>
          
          {status === 'error' && (
            <div className="text-red-600 text-sm">{message}</div>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full rounded-md bg-black py-2 text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {status === 'loading' ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      )}
    </div>
  );
}
