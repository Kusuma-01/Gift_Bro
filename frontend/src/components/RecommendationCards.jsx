import React from 'react';
import { useApp } from '../context/AppContext';
import RecommendationCard from './RecommendationCard';
import ExportButton from './ExportButton';
import { Sparkles, Info, Heart } from 'lucide-react';

export default function RecommendationCards() {
  const { recommendations, inputForm, activeRecipient } = useApp();

  if (!recommendations || !recommendations.gifts || recommendations.gifts.length === 0) {
    return null;
  }

  const recipientName = activeRecipient?.name || inputForm.name || inputForm.relationship || 'Your Recipient';

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-400">
      
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-orange-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-brand-100 text-brand-700">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Top Recommendations for {recipientName}
            </h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Ranked by personalized match score and criteria fit
          </p>
        </div>

        {/* Export Buttons */}
        <ExportButton
          recipientName={recipientName}
          gifts={recommendations.gifts}
        />
      </div>

      {/* Recipient Empathetic Summary Banner */}
      {recommendations.recipient_summary && (
        <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-brand-50 via-orange-50/50 to-rose-50 border border-brand-200/70 flex items-start gap-3 shadow-xs">
          <div className="p-2 rounded-xl bg-white shadow-xs text-brand-600 mt-0.5 shrink-0">
            <Heart className="w-4 h-4" />
          </div>
          <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            <strong className="text-brand-900 font-bold block mb-0.5">GiftBro AI Profile Breakdown:</strong>
            {recommendations.recipient_summary}
          </div>
        </div>
      )}

      {/* Grid of Recommendation Cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendations.gifts.map((gift, idx) => (
          <RecommendationCard
            key={gift.id || `${gift.name}-${idx}`}
            gift={gift}
            rank={idx + 1}
          />
        ))}
      </div>

    </section>
  );
}
