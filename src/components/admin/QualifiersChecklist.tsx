'use client';

import { useState, useTransition } from 'react';
import { saveQualifiers } from '@/actions/admin/qualifiers';
import { Team } from '@prisma/client';

export default function QualifiersChecklist({ initialTeams }: { initialTeams: Team[] }) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(initialTeams.filter((t) => t.qualified).map((t) => t.id))
  );
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [targetCount, setTargetCount] = useState(25);
  const [targetInputValue, setTargetInputValue] = useState<string>('25');

  const handleToggle = (id: string) => {
    setMessage(null);
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSave = () => {
    setMessage(null);
    startTransition(async () => {
      const result = await saveQualifiers(Array.from(selectedIds));
      if (result.success) {
        setMessage({ type: 'success', text: 'Qualifiers successfully locked in!' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to save qualifiers' });
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === initialTeams.length) {
      setSelectedIds(new Set()); // Deselect all
    } else {
      setSelectedIds(new Set(initialTeams.map((t) => t.id))); // Select all
    }
  };

  const selectedCount = selectedIds.size;
  const totalCount = initialTeams.length;
  const isAllSelected = selectedCount === totalCount;
  
  const qualifiedTeams = initialTeams.filter((t) => t.qualified);
  const disqualifiedTeams = initialTeams.filter((t) => !t.qualified);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Qualifier Selection</h2>
          <p className="text-sm text-gray-500 mt-1">
            Showing all {totalCount} registered teams. Select the teams that qualify for Round 2.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex flex-col items-end">
            <span className={`text-2xl font-bold ${selectedCount === targetCount ? 'text-green-600' : selectedCount > targetCount ? 'text-amber-600' : 'text-blue-600'}`}>
              {selectedCount} <span className="text-gray-400 text-lg">/ {totalCount}</span>
            </span>
            <span className="text-xs text-gray-500">Selected</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSelectAll}
              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors border border-gray-300"
            >
              {isAllSelected ? 'Deselect All' : 'Select All'}
            </button>
            <button
              onClick={handleSave}
              disabled={isPending}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isPending ? 'Saving...' : 'Lock Qualifiers'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1 bg-white p-4 rounded-lg shadow-sm border border-gray-200 w-fit">
        <label htmlFor="target-qualifiers" className="text-sm font-medium text-gray-700">
          Teams Qualified:
        </label>
        <div className="flex items-center gap-2">
          <input
            id="target-qualifiers"
            type="number"
            min="1"
            max={totalCount}
            value={targetInputValue}
            onChange={(e) => setTargetInputValue(e.target.value)}
            className="w-20 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            onClick={() => {
              const val = parseInt(targetInputValue);
              if (!isNaN(val) && val >= 1 && val <= totalCount) {
                setTargetCount(val);
              } else if (!isNaN(val) && val > totalCount) {
                setTargetCount(totalCount);
                setTargetInputValue(totalCount.toString());
              } else {
                setTargetCount(1);
                setTargetInputValue('1');
              }
            }}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors border border-gray-300"
          >
            Set
          </button>
        </div>
        <span className="text-xs mt-1">
          {selectedCount === targetCount ? (
            <span className="text-green-600 font-medium">Target met!</span>
          ) : selectedCount > targetCount ? (
            <span className="text-amber-600 font-medium">Over target by {selectedCount - targetCount}</span>
          ) : (
            <span className="text-gray-500">Need {targetCount - selectedCount} more</span>
          )}
        </span>
      </div>

      {message && (
        <div
          className={`p-4 rounded-md text-sm ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {qualifiedTeams.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-green-200 overflow-hidden">
          <div className="bg-green-50 border-b border-green-200 px-4 py-3">
            <h3 className="text-sm font-semibold text-green-900">Qualifiers</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
            {qualifiedTeams.map((team) => (
              <label
                key={team.id}
                className={`flex items-center p-4 border-r border-b border-gray-100 cursor-pointer transition-colors ${
                  selectedIds.has(team.id) ? 'bg-blue-50/50' : 'hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.has(team.id)}
                  onChange={() => handleToggle(team.id)}
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-none"
                />
                <div className="ml-3 flex flex-col">
                  <span className="text-sm font-medium text-gray-900">{team.name}</span>
                  <span className="text-xs text-gray-500">{team.email || 'No email provided'}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {disqualifiedTeams.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mt-6">
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-3">
            <h3 className="text-sm font-semibold text-gray-700">Disqualified</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
            {disqualifiedTeams.map((team) => (
              <label
                key={team.id}
                className={`flex items-center p-4 border-r border-b border-gray-100 cursor-pointer transition-colors ${
                  selectedIds.has(team.id) ? 'bg-blue-50/50' : 'hover:bg-gray-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.has(team.id)}
                  onChange={() => handleToggle(team.id)}
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-none"
                />
                <div className="ml-3 flex flex-col">
                  <span className="text-sm font-medium text-gray-900">{team.name}</span>
                  <span className="text-xs text-gray-500">{team.email || 'No email provided'}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
