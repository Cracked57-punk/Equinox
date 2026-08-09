'use client';

import { Suspense } from 'react';
import ResetForm from '@/components/admin/ResetForm';

export default function AdminResetPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <Suspense fallback={<div>Loading...</div>}>
        <ResetForm />
      </Suspense>
    </div>
  );
}
