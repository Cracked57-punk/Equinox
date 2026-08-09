'use client';

import ForgotPasswordForm from '@/components/admin/ForgotPasswordForm';

export default function AdminForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg border p-8 shadow-sm">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Admin Password Reset</h2>
          <p className="text-sm text-gray-500 mt-2">Enter your email to receive a reset link.</p>
        </div>

        <ForgotPasswordForm />
        
        <div className="text-center text-sm">
          <a href="/admin/login" className="text-blue-600 hover:underline">
            Back to login
          </a>
        </div>
      </div>
    </div>
  );
}
