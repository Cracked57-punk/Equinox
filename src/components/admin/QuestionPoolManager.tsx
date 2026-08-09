'use client';

import { useState, useTransition } from 'react';
import { fetchSheetPreview, commitQuestionPool, ParsedQuestion } from '@/actions/admin/pool';

export default function QuestionPoolManager({ existingCount }: { existingCount: number }) {
  const [url, setUrl] = useState('');
  const [rows, setRows] = useState<ParsedQuestion[]>([]);
  const [isFetching, startFetchTransition] = useTransition();
  const [isCommitting, startCommitTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleFetch = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setRows([]);

    startFetchTransition(async () => {
      const result = await fetchSheetPreview(url);
      if (result.success) {
        setRows(result.rows);
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    });
  };

  const handleCommit = () => {
    setMessage(null);
    startCommitTransition(async () => {
      const result = await commitQuestionPool(rows);
      if (result.success) {
        setMessage({ type: 'success', text: 'Question pool successfully updated!' });
        setRows([]); // Clear preview on success
        setUrl('');
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to commit.' });
      }
    });
  };

  const validCount = rows.filter((r) => r.isValid).length;
  const errorCount = rows.length - validCount;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Import via Google Sheets</h2>
        <form onSubmit={handleFetch} className="flex gap-4">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste Google Sheet URL (must be set to 'Anyone with the link can view')"
            required
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={isFetching || !url}
            className="px-4 py-2 bg-gray-800 text-white font-medium rounded-md hover:bg-gray-900 disabled:opacity-50 transition-colors"
          >
            {isFetching ? 'Fetching...' : 'Preview Import'}
          </button>
        </form>
        {message && (
          <div
            className={`mt-4 p-4 rounded-md text-sm ${
              message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}
      </div>

      {rows.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Parse Preview</h3>
              <p className="text-sm text-gray-500 mt-1">
                Found {rows.length} rows. {validCount} valid, {errorCount} with errors.
              </p>
            </div>
            <button
              onClick={handleCommit}
              disabled={isCommitting || validCount === 0}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isCommitting ? 'Committing...' : `Commit ${validCount} valid questions`}
            </button>
          </div>
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Options</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Answer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Images</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rows.map((row, idx) => (
                  <tr key={idx} className={row.isValid ? '' : 'bg-red-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {row.isValid ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Valid
                        </span>
                      ) : (
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 w-fit">
                            Error
                          </span>
                          <span className="text-xs text-red-600">{row.errors[0]}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={row.text}>
                      {row.text || <span className="text-gray-400 italic">Empty</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex flex-col gap-1">
                        <span className="truncate max-w-[200px]" title={row.optionA}>A: {row.optionA}</span>
                        <span className="truncate max-w-[200px]" title={row.optionB}>B: {row.optionB}</span>
                        <span className="truncate max-w-[200px]" title={row.optionC}>C: {row.optionC}</span>
                        <span className="truncate max-w-[200px]" title={row.optionD}>D: {row.optionD}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                      {row.correctAnswer}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-[150px]" title={row.imageLinks || ''}>
                      {row.imageLinks || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
