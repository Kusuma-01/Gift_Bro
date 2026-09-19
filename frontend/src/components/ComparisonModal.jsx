import React from 'react';
import { X, Award, DollarSign, Tag, ShoppingCart, CheckCircle, Sparkles } from 'lucide-react';

export default function ComparisonModal({ isOpen, onClose, gifts = [], onShopNow }) {
  if (!isOpen || gifts.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-orange-100 p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-brand-100 text-brand-700">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Gift Comparison Matrix
              </h2>
              <p className="text-xs text-slate-500">
                Side-by-side criteria evaluation for {gifts.length} selected gifts
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70">
                <th className="p-3 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/4">Criteria</th>
                {gifts.map((g, idx) => (
                  <th key={g.id || idx} className="p-4 text-sm font-bold text-slate-900 border-l border-slate-200/80">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center">
                        #{g.rank || idx + 1}
                      </span>
                      <span className="line-clamp-2">{g.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              
              {/* Category */}
              <tr>
                <td className="p-3 font-semibold text-slate-500 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-brand-500" /> Category
                </td>
                {gifts.map((g, idx) => (
                  <td key={g.id || idx} className="p-4 border-l border-slate-200/80 font-medium text-slate-700">
                    {g.category}
                  </td>
                ))}
              </tr>

              {/* Price Range */}
              <tr className="bg-amber-50/30">
                <td className="p-3 font-semibold text-slate-500 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-amber-600" /> Estimated Price
                </td>
                {gifts.map((g, idx) => (
                  <td key={g.id || idx} className="p-4 border-l border-slate-200/80 font-bold text-slate-900">
                    {g.price_range}
                  </td>
                ))}
              </tr>

              {/* Match Score */}
              <tr>
                <td className="p-3 font-semibold text-slate-500 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-emerald-600" /> AI Match Score
                </td>
                {gifts.map((g, idx) => (
                  <td key={g.id || idx} className="p-4 border-l border-slate-200/80">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle className="w-3.5 h-3.5" />
                      {g.match_score}% Match
                    </span>
                  </td>
                ))}
              </tr>

              {/* Why it works */}
              <tr className="bg-slate-50/30">
                <td className="p-3 font-semibold text-slate-500">Why this works</td>
                {gifts.map((g, idx) => (
                  <td key={g.id || idx} className="p-4 border-l border-slate-200/80 text-xs text-slate-600 leading-relaxed">
                    {g.reasoning}
                  </td>
                ))}
              </tr>

              {/* CTA */}
              <tr>
                <td className="p-3 font-semibold text-slate-500">Action</td>
                {gifts.map((g, idx) => (
                  <td key={g.id || idx} className="p-4 border-l border-slate-200/80">
                    <button
                      onClick={() => onShopNow(g)}
                      className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-brand-600 to-orange-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:shadow-md transition-all active:scale-[0.98] cursor-pointer"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>Shop Now</span>
                    </button>
                  </td>
                ))}
              </tr>

            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
