import React from 'react';
import Link from 'next/link';

export default function AccessDeniedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
      <h2 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h2>
      <p className="text-gray-600 mb-8 max-w-md">
        You do not have the required tier to view this section of the admin panel. 
        If you believe this is an error, please contact a Tier 3 administrator.
      </p>
      <Link 
        href="/admin/dashboard" 
        className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}
