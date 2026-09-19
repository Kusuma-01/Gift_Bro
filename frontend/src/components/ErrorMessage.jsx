import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ErrorMessage({ message, onRetry }) {
  const { inputForm, generateGiftIdeas } = useApp();

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else if (inputForm.description) {
      generateGiftIdeas(inputForm);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 mt-8 animate-in fade-in duration-200">
      <div className="p-6 rounded-3xl bg-rose-50 border border-rose-200 text-rose-900 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-rose-100 rounded-xl text-rose-700 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm">Failed to generate gift recommendations</h4>
            <p className="text-xs text-rose-700 mt-1 leading-relaxed">
              {message || 'An unexpected error occurred while communicating with the recommendation engine.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleRetry}
          className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Try Again</span>
        </button>
      </div>
    </div>
  );
}
