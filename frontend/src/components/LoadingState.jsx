import React from 'react';
import { Sparkles } from 'lucide-react';

export default function LoadingState() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 animate-in fade-in duration-300">
      
      {/* Loading banner */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-brand-50 border border-brand-200/70 mb-8">
        <div className="w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center animate-spin">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-brand-900">
            GiftBro AI is analyzing personality traits & matching gifts...
          </h4>
          <p className="text-xs text-brand-700">
            Evaluating constraints, interests, price ranges, and uniqueness factors
          </p>
        </div>
      </div>

      {/* Grid of Skeleton Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div
            key={idx}
            className="rounded-3xl bg-white border border-slate-200/70 p-6 shadow-card space-y-4"
          >
            {/* Header: Rank + Tag + Score */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-slate-200 animate-shimmer" />
                <div className="w-24 h-5 rounded-lg bg-slate-200 animate-shimmer" />
              </div>
              <div className="w-20 h-6 rounded-xl bg-slate-200 animate-shimmer" />
            </div>

            {/* Gift Title */}
            <div className="h-6 w-3/4 rounded-xl bg-slate-200 animate-shimmer" />
            
            {/* Price Pill */}
            <div className="h-5 w-20 rounded-md bg-slate-200 animate-shimmer" />

            {/* Reasoning block */}
            <div className="p-3.5 rounded-2xl bg-slate-50 space-y-2 border border-slate-100">
              <div className="h-3 w-1/3 rounded bg-slate-200 animate-shimmer" />
              <div className="h-3 w-full rounded bg-slate-200 animate-shimmer" />
              <div className="h-3 w-4/5 rounded bg-slate-200 animate-shimmer" />
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
              <div className="h-8 w-24 rounded-xl bg-slate-200 animate-shimmer" />
              <div className="h-8 w-24 rounded-xl bg-slate-200 animate-shimmer" />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
