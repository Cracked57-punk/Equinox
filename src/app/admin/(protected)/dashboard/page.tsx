import React from 'react';
import { requireAdmin } from '@/lib/auth/session';

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold mb-4">Welcome, {admin.name}</h2>
      <p className="text-gray-600 mb-8">
        You are logged in as an admin. 
      </p>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-2">Notice</h3>
        <p className="text-gray-600">
          More sections will appear here in the sidebar as they are built during the upcoming phases of development.
          (e.g., Question Pool, Team Qualifiers, Timer Settings, Round Control, and Leaderboard).
        </p>
      </div>
    </div>
  );
}
