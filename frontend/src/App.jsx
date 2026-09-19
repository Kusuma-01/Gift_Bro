import React from 'react';
import { useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import RecipientInput from './components/RecipientInput';
import RecommendationCards from './components/RecommendationCards';
import ChatRefinement from './components/ChatRefinement';
import RecipientProfiles from './components/RecipientProfiles';
import GiftHistory from './components/GiftHistory';
import LoadingState from './components/LoadingState';
import ErrorMessage from './components/ErrorMessage';
import EmptyState from './components/EmptyState';
import Toast from './components/Toast';
import { Gift, Heart } from 'lucide-react';

export default function App() {
  const { activeTab, isLoading, recommendations, error } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFAF6] text-slate-800">
      
      {/* Toast Notifications */}
      <Toast />

      {/* Top Navbar */}
      <Navbar />

      {/* Main App Content */}
      <main className="flex-1 pb-16">
        {activeTab === 'generator' && (
          <>
            <HeroSection />
            <RecipientInput />

            {error && <ErrorMessage message={error} />}

            {isLoading && <LoadingState />}

            {!isLoading && recommendations && (
              <>
                <RecommendationCards />
                <ChatRefinement />
              </>
            )}

            {!isLoading && !recommendations && !error && (
              <EmptyState />
            )}
          </>
        )}

        {activeTab === 'recipients' && <RecipientProfiles />}

        {activeTab === 'history' && <GiftHistory />}
      </main>

      {/* Footer */}
      <footer className="border-t border-orange-100/80 bg-white/60 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <Gift className="w-4 h-4 text-brand-500" />
            <span>GiftBro AI</span>
            <span className="font-normal text-slate-400">— Thoughtful Gift Recommendation Engine</span>
          </div>

          <div className="flex items-center gap-1 text-slate-400">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>using React, Node.js, SQLite & AI</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
