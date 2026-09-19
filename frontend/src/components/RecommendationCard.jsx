import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bookmark, ShoppingBag, Archive, Sparkles, Tag, DollarSign, Award, ShoppingCart } from 'lucide-react';
import ShoppingModal from './ShoppingModal';

export default function RecommendationCard({ gift, rank }) {
  const { updateGiftStatus, refineGiftIdeas, isLoading } = useApp();
  const [isShoppingModalOpen, setIsShoppingModalOpen] = useState(false);

  const isSaved = gift.status === 'saved';
  const isBought = gift.status === 'bought';
  const isArchived = gift.status === 'archived';

  // Match score color
  const getScoreColor = (score) => {
    if (score >= 93) return 'from-emerald-500 to-teal-600 text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 88) return 'from-brand-500 to-amber-600 text-brand-700 bg-brand-50 border-brand-200';
    return 'from-blue-500 to-indigo-600 text-blue-700 bg-blue-50 border-blue-200';
  };

  const handleMoreLikeThis = () => {
    refineGiftIdeas(`Show me more gifts like "${gift.name}" (${gift.category}) with a similar vibe`);
  };

  return (
    <>
      <div className={`relative flex flex-col justify-between rounded-3xl bg-white p-5 sm:p-6 border transition-all duration-200 hover:-translate-y-1 shadow-card hover:shadow-card-hover ${
        isBought 
          ? 'border-emerald-300 ring-2 ring-emerald-100 bg-emerald-50/20' 
          : isArchived
          ? 'border-slate-200 opacity-60 bg-slate-50/40'
          : isSaved
          ? 'border-brand-300 ring-2 ring-brand-100'
          : 'border-orange-100/80 hover:border-brand-200'
      }`}>
        
        <div>
          {/* Top Header: Rank, Category, Match Score */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-xl bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                #{gift.rank || rank}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200/60 line-clamp-1">
                <Tag className="w-3 h-3 text-slate-400" />
                {gift.category}
              </span>
            </div>

            {/* Match Score Badge */}
            <div className={`px-2.5 py-1 rounded-xl text-xs font-bold border flex items-center gap-1 ${getScoreColor(gift.match_score)}`}>
              <Award className="w-3.5 h-3.5" />
              <span>{gift.match_score}% Match</span>
            </div>
          </div>

          {/* Gift Name */}
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug group-hover:text-brand-600 transition-colors">
            {gift.name}
          </h3>

          {/* Explicit Estimated Price Range */}
          <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200/70">
            <DollarSign className="w-3.5 h-3.5 text-amber-600" />
            <span>Estimated Price: {gift.price_range}</span>
          </div>

          {/* Why it matches */}
          <div className="mt-4 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 text-xs text-slate-600 leading-relaxed">
            <strong className="block text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
              Why this works:
            </strong>
            <p>{gift.reasoning}</p>
          </div>
        </div>

        {/* Action Buttons: Save, Bought, Archive, More Like This, and Shop Now */}
        <div className="mt-5 pt-4 border-t border-slate-100/90">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              {/* Save / Wishlist Button */}
              <button
                onClick={() => updateGiftStatus(gift, isSaved ? 'suggested' : 'saved')}
                className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  isSaved
                    ? 'bg-brand-500 border-brand-600 text-white shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:text-brand-600 hover:border-brand-200'
                }`}
                title={isSaved ? 'Remove from saved' : 'Save gift to wishlist'}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-white' : ''}`} />
                <span>{isSaved ? 'Saved' : 'Save'}</span>
              </button>

              {/* Bought Button */}
              <button
                onClick={() => updateGiftStatus(gift, isBought ? 'suggested' : 'bought')}
                className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  isBought
                    ? 'bg-emerald-600 border-emerald-700 text-white shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:text-emerald-600 hover:border-emerald-200'
                }`}
                title={isBought ? 'Unmark as bought' : 'Mark as purchased!'}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{isBought ? 'Bought ✓' : 'Bought'}</span>
              </button>

              {/* Archive Button */}
              <button
                onClick={() => updateGiftStatus(gift, isArchived ? 'suggested' : 'archived')}
                className={`p-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  isArchived
                    ? 'bg-slate-700 border-slate-800 text-white'
                    : 'bg-white border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300'
                }`}
                title={isArchived ? 'Unarchive' : 'Archive (Do not suggest again)'}
              >
                <Archive className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* More Like This Button */}
            <button
              onClick={handleMoreLikeThis}
              disabled={isLoading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-500" />
              <span>More Like This</span>
            </button>
          </div>

          {/* Prominent Shop Now CTA */}
          <button
            onClick={() => setIsShoppingModalOpen(true)}
            className="w-full mt-3 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-brand-600 via-orange-500 to-rose-600 hover:from-brand-500 hover:via-orange-400 hover:to-rose-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>🛒 Shop Now</span>
          </button>
        </div>

      </div>

      {/* Shopping Platform Selector Modal */}
      <ShoppingModal
        isOpen={isShoppingModalOpen}
        onClose={() => setIsShoppingModalOpen(false)}
        gift={gift}
      />
    </>
  );
}
