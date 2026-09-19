import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MessageSquare, Send, Sparkles, User, Bot, CornerDownRight } from 'lucide-react';

const REFINEMENT_CHIPS = [
  "Make them cheaper",
  "Show me something more unique",
  "No clothing",
  "Give me something weird",
  "Show me gifts under $40",
  "Give me experience-based gifts",
  "Surprise me"
];

export default function ChatRefinement() {
  const { conversationHistory, refineGiftIdeas, isLoading, recommendations } = useApp();
  const [refinementInput, setRefinementInput] = useState('');
  const chatBottomRef = useRef(null);

  // Auto-scroll chat on update
  useEffect(() => {
    if (conversationHistory.length > 2) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversationHistory]);

  if (!recommendations || !recommendations.gifts || recommendations.gifts.length === 0) {
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!refinementInput.trim() || isLoading) return;
    const text = refinementInput.trim();
    setRefinementInput('');
    refineGiftIdeas(text);
  };

  const handleChipClick = (chip) => {
    if (isLoading) return;
    refineGiftIdeas(chip);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 mt-12 mb-16">
      <div className="rounded-3xl bg-white border border-orange-100 shadow-card p-6 sm:p-8">
        
        {/* Section Header */}
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Conversational Refinement</h3>
            <p className="text-xs text-slate-500">
              Not quite right? Instruct GiftBro AI to adjust the budget, style, category, or uniqueness.
            </p>
          </div>
        </div>

        {/* Conversation Stream */}
        {conversationHistory.length > 0 && (
          <div className="space-y-3 mb-6 max-h-72 overflow-y-auto pr-2">
            {conversationHistory.map((msg, idx) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-2.5 text-xs sm:text-sm ${
                    isUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {!isUser && (
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-brand-500 to-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`p-3.5 rounded-2xl max-w-[85%] sm:max-w-[75%] leading-relaxed ${
                      isUser
                        ? 'bg-brand-600 text-white rounded-tr-none shadow-xs font-medium'
                        : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200/50'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {isUser && (
                    <div className="w-7 h-7 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={chatBottomRef} />
          </div>
        )}

        {/* Suggested Quick Refinement Chips */}
        <div className="mb-4">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3 text-brand-500" />
            <span>Suggested Refinements:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {REFINEMENT_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleChipClick(chip)}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-50 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 border border-slate-200 text-slate-600 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                "{chip}"
              </button>
            ))}
          </div>
        </div>

        {/* Custom Refinement Input Form */}
        <form onSubmit={handleSubmit} className="relative mt-3">
          <input
            type="text"
            value={refinementInput}
            onChange={(e) => setRefinementInput(e.target.value)}
            placeholder="Type custom refinement (e.g. 'Keep it under $35', 'No books', 'More artistic')..."
            disabled={isLoading}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-3.5 pl-4 pr-12 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-brand-500 focus:ring-4 focus:ring-brand-100 outline-none transition-all"
          />

          <button
            type="submit"
            disabled={isLoading || !refinementInput.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-xs cursor-pointer"
            title="Send refinement"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
