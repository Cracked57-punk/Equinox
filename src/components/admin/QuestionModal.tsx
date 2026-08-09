'use client';

import { useState, useTransition } from 'react';
import { addQuestion, updateQuestion } from '@/actions/admin/pool';

type QuestionFormData = {
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  imageLinks: string;
};

export default function QuestionModal({
  isOpen,
  onClose,
  initialData,
  questionId,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialData?: QuestionFormData;
  questionId?: string;
}) {
  const [formData, setFormData] = useState<QuestionFormData>(
    initialData || {
      text: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A',
      imageLinks: '',
    }
  );

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const payload = {
        ...formData,
        imageLinks: formData.imageLinks.trim() || null,
      };

      const result = questionId
        ? await updateQuestion(questionId, payload)
        : await addQuestion(payload);

      if (result.success) {
        onClose();
      } else {
        setError((result as any).error || 'An unknown error occurred');
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl my-8">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            {questionId ? 'Edit Question' : 'Add Question'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {error && <div className="p-3 text-sm text-red-800 bg-red-50 rounded-md">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700">Question Text</label>
            <textarea
              required
              rows={3}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Option A</label>
              <input
                required
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.optionA}
                onChange={(e) => setFormData({ ...formData, optionA: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Option B</label>
              <input
                required
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.optionB}
                onChange={(e) => setFormData({ ...formData, optionB: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Option C</label>
              <input
                required
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.optionC}
                onChange={(e) => setFormData({ ...formData, optionC: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Option D</label>
              <input
                required
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                value={formData.optionD}
                onChange={(e) => setFormData({ ...formData, optionD: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Correct Answer</label>
              <select
                value={formData.correctAnswer}
                onChange={(e) => setFormData({ ...formData, correctAnswer: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Image Links (comma separated)</label>
              <input
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Optional"
                value={formData.imageLinks}
                onChange={(e) => setFormData({ ...formData, imageLinks: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? 'Saving...' : 'Save Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
