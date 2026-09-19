import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, SlidersHorizontal, Trash2, User, Heart, Calendar, DollarSign, Clock } from 'lucide-react';
import VoiceInputButton from './VoiceInputButton';

export default function RecipientInput() {
  const { inputForm, setInputForm, generateGiftIdeas, isLoading, activeRecipient, setActiveRecipient } = useApp();
  const [showAdvanced, setShowAdvanced] = useState(false);
  const baseTextRef = useRef('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputForm.description.trim()) return;
    generateGiftIdeas(inputForm);
  };

  const handleClear = () => {
    setInputForm({
      description: '',
      name: '',
      relationship: '',
      occasion: '',
      budget: '',
      age: '',
    });
    setActiveRecipient(null);
  };

  const handleVoiceStart = () => {
    baseTextRef.current = inputForm.description ? inputForm.description.trim() : '';
  };

  const handleVoiceUpdate = (transcriptText) => {
    if (!transcriptText || !transcriptText.trim()) return;

    const base = baseTextRef.current;
    if (!base) {
      setInputForm(prev => ({ ...prev, description: transcriptText.trim() }));
    } else {
      const needsPunctuation = !/[.!?]$/.test(base);
      const combined = `${base}${needsPunctuation ? '.' : ''} ${transcriptText.trim()}`;
      setInputForm(prev => ({ ...prev, description: combined }));
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4">
      <div className="bg-white rounded-3xl shadow-card border border-orange-100 p-6 sm:p-8 transition-all hover:shadow-card-hover">
        
        {activeRecipient && (
          <div className="mb-4 p-3 bg-brand-50 border border-brand-200 rounded-xl flex items-center justify-between text-xs">
            <span className="text-brand-900 font-medium">
              Editing profile for: <strong>{activeRecipient.name}</strong> ({activeRecipient.relationship || 'Recipient'})
            </span>
            <button
              onClick={() => setActiveRecipient(null)}
              className="text-brand-700 hover:text-brand-900 underline font-semibold"
            >
              Start New Search
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Conversational Textarea with Voice Input */}
          <div className="relative">
            <div className="flex items-center justify-between gap-2 mb-2">
              <label htmlFor="description" className="block text-sm font-bold text-slate-800">
                Describe the recipient naturally:
              </label>
              <VoiceInputButton
                onVoiceStart={handleVoiceStart}
                onVoiceUpdate={handleVoiceUpdate}
                disabled={isLoading}
              />
            </div>

            <textarea
              id="description"
              rows={4}
              value={inputForm.description}
              onChange={(e) => setInputForm({ ...inputForm, description: e.target.value })}
              placeholder="Tell me about the person you're buying for...&#10;Example: My brother is 28, loves hiking, sci-fi and board games. We're close and my budget is $50-80."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-slate-800 text-sm sm:text-base placeholder-slate-400 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-100 outline-none transition-all resize-none shadow-inner"
              required
            />
          </div>

          {/* Toggle Structured Fields */}
          <div className="mt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-brand-600 py-1 transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-brand-500" />
              <span>{showAdvanced ? 'Hide Specific Details' : '+ Add Specific Details (Name, Occasion, Budget...)'}</span>
            </button>

            {inputForm.description && (
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-rose-600 py-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>

          {/* Optional Structured Fields */}
          {showAdvanced && (
            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" /> Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex"
                  value={inputForm.name}
                  onChange={(e) => setInputForm({ ...inputForm, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <Heart className="w-3 h-3 text-slate-400" /> Relationship
                </label>
                <input
                  type="text"
                  placeholder="e.g. Brother, Mom, Coworker"
                  value={inputForm.relationship}
                  onChange={(e) => setInputForm({ ...inputForm, relationship: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-slate-400" /> Budget
                </label>
                <input
                  type="text"
                  placeholder="e.g. $50-80 or Under $40"
                  value={inputForm.budget}
                  onChange={(e) => setInputForm({ ...inputForm, budget: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" /> Occasion
                </label>
                <input
                  type="text"
                  placeholder="e.g. Birthday, Holiday"
                  value={inputForm.occasion}
                  onChange={(e) => setInputForm({ ...inputForm, occasion: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" /> Age
                </label>
                <input
                  type="text"
                  placeholder="e.g. 28 or Early 60s"
                  value={inputForm.age}
                  onChange={(e) => setInputForm({ ...inputForm, age: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none"
                />
              </div>
            </div>
          )}

          {/* Submit Action */}
          <div className="mt-6">
            <button
              type="submit"
              disabled={isLoading || !inputForm.description.trim()}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-brand-600 via-orange-500 to-rose-600 hover:from-brand-500 hover:via-orange-400 hover:to-rose-500 text-white font-bold text-base shadow-lg shadow-brand-500/25 hover:shadow-xl hover:shadow-brand-500/30 transition-all transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  <span>GiftBro AI is analyzing recipient & generating gifts...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>✨ Find Perfect Gifts</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
