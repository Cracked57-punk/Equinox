import { requireAdmin } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import QuestionPoolManager from '@/components/admin/QuestionPoolManager';
import QuestionList from '@/components/admin/QuestionList';

export default async function QuestionPoolPage() {
  await requireAdmin();

  const activeQuestions = await prisma.question.findMany({
    where: { active: true },
    orderBy: { importedAt: 'desc' },
  });

  const existingCount = activeQuestions.length;

  return (
    <div className="space-y-12 max-w-6xl pb-12">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Question Pool Import</h1>
          <p className="text-gray-500 mt-1">Import Round 2 questions from a Google Sheet.</p>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md">
          <h3 className="text-sm font-bold text-blue-800">ℹ️ Import Behavior</h3>
          <p className="text-sm text-blue-700 mt-1">
            Committing a new sheet import will <strong>append</strong> the imported questions to your active pool. 
            Any manual edits or additions made below are perfectly safe and will not be overwritten.
          </p>
        </div>

        <QuestionPoolManager existingCount={existingCount} />
      </div>

      <div className="pt-8 border-t border-gray-200">
        <QuestionList questions={activeQuestions} />
      </div>
    </div>
  );
}
