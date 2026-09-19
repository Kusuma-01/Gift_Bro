import React from 'react';
import { Gift, Sparkles, Sliders, ShieldCheck } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="max-w-4xl mx-auto px-4 mt-12 mb-16">
      <div className="rounded-3xl border border-dashed border-orange-200/80 bg-white/60 p-8 sm:p-12 text-center">
        
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-100 to-rose-100 text-brand-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
          <Gift className="w-7 h-7" />
        </div>

        <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">
          Ready to uncover the ideal gift
        </h3>

        <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
          Type your recipient's story above or pick one of the sample scenarios. GiftBro AI will curate 6-8 specific, non-generic gifts with tailored reasoning.
        </p>

        {/* Feature pillars */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-2xl mx-auto">
          <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 w-fit mb-2">
              <Sparkles className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-xs text-slate-800">Hyper-Specific Ideas</h4>
            <p className="text-[11px] text-slate-500 mt-1">
              No generic "gadget" or "mug" filler. Curated items with brand and contextual fit.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs">
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600 w-fit mb-2">
              <Sliders className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-xs text-slate-800">Live Chat Refinement</h4>
            <p className="text-[11px] text-slate-500 mt-1">
              Adjust budget, exclude categories, or request unique twists on the fly.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 w-fit mb-2">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-xs text-slate-800">Duplicate Prevention</h4>
            <p className="text-[11px] text-slate-500 mt-1">
              Remembers past bought and archived items so you never gift the same thing twice.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
