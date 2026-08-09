'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Question } from '@prisma/client';
import QuestionModal from './QuestionModal';
import { deleteQuestion } from '@/actions/admin/pool';

export default function QuestionList({ questions }: { questions: Question[] }) {
  const router = useRouter();
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      startTransition(async () => {
        await deleteQuestion(id);
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900">Active Question Pool</h2>
          <button
            onClick={() => {
              startTransition(() => {
                router.refresh();
              });
            }}
            disabled={isPending}
            className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50 flex items-center gap-1"
            title="Sync latest questions from database"
          >
            <svg className={`w-4 h-4 ${isPending ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Sync
          </button>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors"
        >
          + Add Question
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto max-h-[800px] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/2">Question</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Answer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {questions.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                    No questions in the pool. Import from a sheet or add one manually.
                  </td>
                </tr>
              ) : (
                questions.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 mb-1">{q.text}</div>
                      <div className="text-xs text-gray-500 grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                        <span className={q.correctAnswer === 'A' ? 'font-bold text-green-700' : ''}>A: {q.optionA}</span>
                        <span className={q.correctAnswer === 'B' ? 'font-bold text-green-700' : ''}>B: {q.optionB}</span>
                        <span className={q.correctAnswer === 'C' ? 'font-bold text-green-700' : ''}>C: {q.optionC}</span>
                        <span className={q.correctAnswer === 'D' ? 'font-bold text-green-700' : ''}>D: {q.optionD}</span>
                      </div>
                      {q.imageLinks && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {q.imageLinks.split(',').map((link, i) => (
                            <a
                              key={i}
                              href={link.trim()}
                              target="_blank"
                              rel="noreferrer"
                              className="relative flex items-center justify-center h-12 w-12 border border-gray-200 rounded overflow-hidden hover:opacity-80 transition-opacity bg-gray-100"
                              title={link.trim()}
                            >
                              <img
                                src={link.trim()}
                                alt={`Attachment ${i + 1}`}
                                className="object-cover w-full h-full"
                                onError={(e) => {
                                  // Fallback if image fails to load (e.g. if it's a PDF link or blocked)
                                  e.currentTarget.style.display = 'none';
                                  const parent = e.currentTarget.parentElement;
                                  if (parent) {
                                    parent.className = 'text-xs text-blue-600 underline bg-transparent border-none w-auto h-auto mt-1';
                                    parent.textContent = `Link ${i + 1}`;
                                  }
                                }}
                              />
                            </a>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-800 font-bold text-sm">
                        {q.correctAnswer}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => setEditingQuestion(q)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(q.id)}
                          disabled={isPending}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <QuestionModal
        isOpen={isAdding}
        onClose={() => setIsAdding(false)}
      />

      {editingQuestion && (
        <QuestionModal
          isOpen={true}
          onClose={() => setEditingQuestion(null)}
          questionId={editingQuestion.id}
          initialData={{
            text: editingQuestion.text,
            optionA: editingQuestion.optionA,
            optionB: editingQuestion.optionB,
            optionC: editingQuestion.optionC,
            optionD: editingQuestion.optionD,
            correctAnswer: editingQuestion.correctAnswer,
            imageLinks: editingQuestion.imageLinks || '',
          }}
        />
      )}
    </div>
  );
}
