import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Gift, Users, History, Sparkles, HelpCircle, CheckCircle, Info, ExternalLink, User, LogIn, LogOut, FileText } from 'lucide-react';

export default function Navbar() {
  const { activeTab, setActiveTab, recipients, aiStatus, user, setIsAuthModalOpen, logoutUser } = useApp();
  const [showAiModal, setShowAiModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-orange-100 shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab('generator')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-rose-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
            <Gift className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 via-brand-800 to-rose-700 bg-clip-text text-transparent">
                GiftBro
              </span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-brand-100 text-brand-700 uppercase tracking-wider">
                AI
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">Personalized Gift Recommendation Engine</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('generator')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'generator'
                ? 'bg-brand-50 text-brand-700 shadow-sm border border-brand-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <Sparkles className="w-4 h-4 text-brand-500" />
            <span>Find Gifts</span>
          </button>

          <button
            onClick={() => setActiveTab('recipients')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all relative ${
              activeTab === 'recipients'
                ? 'bg-brand-50 text-brand-700 shadow-sm border border-brand-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <Users className="w-4 h-4 text-brand-500" />
            <span>Saved Recipients</span>
            {recipients.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[11px] font-semibold bg-brand-100 text-brand-800">
                {recipients.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-brand-50 text-brand-700 shadow-sm border border-brand-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <History className="w-4 h-4 text-brand-500" />
            <span className="hidden sm:inline">Gift History</span>
            <span className="sm:hidden">History</span>
          </button>
        </nav>

        {/* Right Action Controls: AI Badge, API Docs link & User Auth */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Swagger API Docs button */}
          <a
            href="http://localhost:3001/api-docs"
            target="_blank"
            rel="noopener noreferrer"
            title="Open Interactive Swagger API Documentation"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors border border-slate-200"
          >
            <FileText className="w-3.5 h-3.5 text-brand-600" />
            <span>API Docs</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          {/* AI Mode Indicator / Status Badge */}
          <div className="relative">
            <button
              onClick={() => setShowAiModal(!showAiModal)}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer shadow-xs ${
                aiStatus.is_live
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  aiStatus.is_live ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span className="hidden sm:inline">{aiStatus.is_live ? 'Live LLM Mode' : 'Demo Fallback Mode'}</span>
              <span className="sm:hidden">{aiStatus.is_live ? 'LLM' : 'Demo'}</span>
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* AI Info Popover */}
            {showAiModal && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 p-4 rounded-2xl bg-white shadow-xl border border-slate-100 text-slate-700 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${aiStatus.is_live ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {aiStatus.is_live ? <CheckCircle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {aiStatus.is_live ? 'Live AI Connected' : 'Heuristic Demo Mode'}
                    </h4>
                  </div>
                  <button
                    onClick={() => setShowAiModal(false)}
                    className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
                  >
                    ✕
                  </button>
                </div>

                <div className="mt-3 text-xs space-y-2 text-slate-600 leading-relaxed">
                  {aiStatus.is_live ? (
                    <p>
                      GiftBro AI is actively communicating with <strong className="text-emerald-700 uppercase">{aiStatus.provider}</strong> to generate dynamic recommendations with deep contextual reasoning.
                    </p>
                  ) : (
                    <>
                      <p>
                        The app is currently operating in <strong>Zero-Config Demo Mode</strong> with a rich local heuristic recommendation engine.
                      </p>
                      <p className="p-2.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200">
                        💡 To activate live AI, add your <code className="font-mono bg-white px-1 rounded">GEMINI_API_KEY</code> or <code className="font-mono bg-white px-1 rounded">OPENAI_API_KEY</code> to <code className="font-mono bg-white px-1 rounded">backend/.env</code> and restart the server.
                      </p>
                    </>
                  )}
                  <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-100">
                    <span>Provider: {aiStatus.provider}</span>
                    <span className="text-emerald-600 font-medium">Fully Functional</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Auth Profile / Login Button */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-xs"
              >
                <div className="w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center text-[10px] uppercase">
                  {user.name ? user.name[0] : 'U'}
                </div>
                <span className="max-w-[100px] truncate">{user.name}</span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 p-2 rounded-2xl bg-white shadow-xl border border-slate-100 text-slate-700 z-50 animate-in fade-in duration-150">
                  <div className="p-2 border-b border-slate-100 text-xs">
                    <p className="font-bold text-slate-900 truncate">{user.name}</p>
                    <p className="text-slate-400 text-[11px] truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => { logoutUser(); setShowUserMenu(false); }}
                    className="w-full mt-1 flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-brand-600 to-orange-500 text-white text-xs font-bold hover:from-brand-500 hover:to-orange-400 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
