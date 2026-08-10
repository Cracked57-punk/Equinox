import React from 'react';
import { requireAdmin } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();

  const totalTeams = await prisma.team.count();
  const qualifiedTeams = await prisma.team.count({ where: { qualified: true } });
  const totalQuestions = await prisma.question.count();

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold mb-4">Welcome, {admin.name}</h2>
      <p className="text-gray-600 mb-8">
        You are logged in as an admin. 
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium mb-1">Total Teams</h3>
          <p className="text-3xl font-bold text-gray-900">{totalTeams}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium mb-1">Qualified Teams</h3>
          <p className="text-3xl font-bold text-indigo-600">{qualifiedTeams}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium mb-1">Questions in Pool</h3>
          <p className="text-3xl font-bold text-gray-900">{totalQuestions}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
        <div className="flex flex-col gap-3">
          <Link href="/admin/qualifiers" className="text-indigo-600 hover:underline">Manage Team Qualifiers &rarr;</Link>
          <Link href="/admin/controls" className="text-indigo-600 hover:underline">Go to Round 2 Control Center &rarr;</Link>
          <Link href="/admin/leaderboard" className="text-indigo-600 hover:underline">View Live Leaderboard &rarr;</Link>
        </div>
      </div>
    </div>
  );
}
