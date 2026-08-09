'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { syncAnswer, submitExam } from '@/actions/exam';
import { useRouter } from 'next/navigation';

type Question = {
  id: string;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  imageLinks: string | null;
};

type Answer = {
  id: string;
  order: number;
  selected: string | null;
  status: string;
  question: Question;
};

type ExamSession = {
  id: string;
  endsAt: Date | null;
  answers: Answer[];
};

export function ExamClient({ initialSession, teamName }: { initialSession: any; teamName: string }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answer[]>(initialSession.answers);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const endsAt = initialSession.endsAt ? new Date(initialSession.endsAt) : null;

  // Initialize and tick timer
  useEffect(() => {
    if (!endsAt) return;

    const calcTime = () => Math.max(0, Math.floor((endsAt.getTime() - Date.now()) / 1000));
    setTimeLeft(calcTime());

    const interval = setInterval(() => {
      const remaining = calcTime();
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        handleAutoSubmit();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endsAt]);

  const handleAutoSubmit = useCallback(async () => {
    setIsSubmitting(true);
    await submitExam(true);
    router.refresh();
  }, [router]);

  const handleManualSubmit = async () => {
    if (confirm('Are you sure you want to submit your exam? You cannot undo this.')) {
      setIsSubmitting(true);
      await submitExam(false);
      router.refresh();
    }
  };

  const currentAnswer = answers[currentIndex];
  const q = currentAnswer?.question;

  // Mark as not_answered if it was not_visited
  useEffect(() => {
    if (currentAnswer && currentAnswer.status === 'not_visited') {
      updateAnswerState(currentIndex, currentAnswer.selected, 'not_answered');
    }
  }, [currentIndex, currentAnswer]);

  const updateAnswerState = async (index: number, selected: string | null, status: string) => {
    const target = answers[index];
    if (target.selected === selected && target.status === status) return;

    // Optimistic UI update
    const newAnswers = [...answers];
    newAnswers[index] = { ...target, selected, status };
    setAnswers(newAnswers);

    // Sync to DB
    await syncAnswer(target.id, selected, status);
  };

  const handleOptionSelect = (option: string) => {
    const newStatus = currentAnswer.status.includes('marked') ? 'answered_marked' : 'answered';
    updateAnswerState(currentIndex, option, newStatus);
  };

  const handleClearResponse = () => {
    const newStatus = currentAnswer.status.includes('marked') ? 'marked_for_review' : 'not_answered';
    updateAnswerState(currentIndex, null, newStatus);
  };

  const handleMarkForReview = () => {
    let newStatus = currentAnswer.status;
    if (currentAnswer.selected) {
      newStatus = 'answered_marked';
    } else {
      newStatus = 'marked_for_review';
    }
    updateAnswerState(currentIndex, currentAnswer.selected, newStatus);
    if (currentIndex < answers.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSaveAndNext = () => {
    // If it's currently marked, unmark it when clicking save and next
    let newStatus = currentAnswer.status;
    if (currentAnswer.selected) {
      newStatus = 'answered';
    } else {
      newStatus = 'not_answered';
    }
    updateAnswerState(currentIndex, currentAnswer.selected, newStatus);
    
    if (currentIndex < answers.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'answered': return 'bg-green-600 text-white border-green-700';
      case 'not_answered': return 'bg-red-500 text-white border-red-600';
      case 'marked_for_review': return 'bg-purple-600 text-white border-purple-700';
      case 'answered_marked': return 'bg-purple-600 text-white border-purple-700 ring-2 ring-green-400 ring-inset';
      case 'not_visited':
      default: return 'bg-gray-200 text-gray-800 border-gray-300';
    }
  };

  const stats = useMemo(() => {
    return {
      answered: answers.filter(a => a.status === 'answered').length,
      notAnswered: answers.filter(a => a.status === 'not_answered').length,
      notVisited: answers.filter(a => a.status === 'not_visited').length,
      marked: answers.filter(a => a.status === 'marked_for_review').length,
      answeredMarked: answers.filter(a => a.status === 'answered_marked').length,
    };
  }, [answers]);

  if (isSubmitting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p>Submitting exam...</p>
        </div>
      </div>
    );
  }

  const images = q?.imageLinks ? q.imageLinks.split(',').map(s => s.trim()).filter(Boolean) : [];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans text-gray-900">
      {/* Header */}
      <header className="bg-indigo-900 text-white px-4 py-3 flex items-center justify-between shadow-md shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Equinox</h1>
          <p className="text-sm text-indigo-200">{teamName}</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-xs text-indigo-200 uppercase font-bold tracking-wider">Time Left</p>
            <p className={`text-2xl font-mono ${timeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
              {formatTime(timeLeft)}
            </p>
          </div>
          <button 
            onClick={handleManualSubmit}
            className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-md font-bold transition-colors"
          >
            Submit Exam
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left side: Question Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          <div className="flex-1 overflow-y-auto p-6 md:p-10">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Question {currentIndex + 1}</h2>
              </div>
              
              <div className="prose max-w-none text-lg text-gray-800 mb-8 whitespace-pre-wrap">
                {q?.text}
              </div>

              {images.length > 0 && (
                <div className="flex flex-col gap-4 mb-8">
                  {images.map((img, i) => (
                    <img key={i} src={img} alt={`Question ${currentIndex + 1} image ${i + 1}`} className="max-w-full h-auto rounded border border-gray-200 shadow-sm" />
                  ))}
                </div>
              )}

              <div className="space-y-3">
                {['A', 'B', 'C', 'D'].map((opt) => {
                  const val = q?.[`option${opt}` as keyof Question] as string;
                  const isSelected = currentAnswer?.selected === opt;
                  return (
                    <label 
                      key={opt}
                      className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-indigo-600 bg-indigo-50 shadow-sm' 
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center h-6 mr-4">
                        <input 
                          type="radio" 
                          name={`question-${q?.id}`}
                          value={opt}
                          checked={isSelected}
                          onChange={() => handleOptionSelect(opt)}
                          className="w-5 h-5 text-indigo-600 border-gray-300 focus:ring-indigo-600"
                        />
                      </div>
                      <div className="flex-1">
                        <span className="font-bold text-gray-500 mr-2">{opt}.</span>
                        <span className="text-gray-800">{val}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="bg-white border-t border-gray-200 p-4 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="max-w-4xl mx-auto flex flex-wrap gap-3 justify-between">
              <div className="flex gap-3">
                <button 
                  onClick={handleClearResponse}
                  disabled={!currentAnswer?.selected}
                  className="px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear Response
                </button>
                <button 
                  onClick={handleMarkForReview}
                  className="px-4 py-2 border border-purple-300 text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-md font-medium"
                >
                  Mark for Review & Next
                </button>
              </div>
              <button 
                onClick={handleSaveAndNext}
                className="px-8 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-md font-medium shadow-sm"
              >
                Save & Next
              </button>
            </div>
          </div>
        </div>

        {/* Right side: Palette */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col shrink-0 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h3 className="font-bold text-gray-700 mb-3">Question Palette</h3>
            
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-green-600 text-white font-bold">{stats.answered}</span> Answered
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-red-500 text-white font-bold">{stats.notAnswered}</span> Not Answered
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 text-gray-800 font-bold">{stats.notVisited}</span> Not Visited
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-purple-600 text-white font-bold">{stats.marked}</span> Marked for Review
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-purple-600 text-white font-bold ring-2 ring-green-400 ring-inset">{stats.answeredMarked}</span> Answered & Marked for Review
              </div>
            </div>
          </div>

          <div className="p-4 flex-1 overflow-y-auto">
            <div className="grid grid-cols-4 gap-3">
              {answers.map((ans, idx) => (
                <button
                  key={ans.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`
                    w-12 h-12 flex items-center justify-center rounded-md font-bold text-sm border shadow-sm transition-all
                    ${getStatusColor(ans.status)}
                    ${currentIndex === idx ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : 'hover:opacity-80'}
                  `}
                  title={ans.status.replace(/_/g, ' ')}
                >
                  {ans.order}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
