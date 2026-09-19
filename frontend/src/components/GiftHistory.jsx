import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { History, Bookmark, ShoppingBag, Archive, Sparkles, Filter, Tag, DollarSign, Calendar, Search, ShoppingCart } from 'lucide-react';
import ExportButton from './ExportButton';
import ShoppingModal from './ShoppingModal';
import { api } from '../services/api';

export default function GiftHistory() {
  const {
    recipients,
    historyRecipientId,
    setHistoryRecipientId,
    updateGiftStatus,
    addToast
  } = useApp();

  const [allGifts, setAllGifts] = useState([]);
  const [activeStatusFilter, setActiveStatusFilter] = useState('all'); // 'all' | 'saved' | 'bought' | 'archived' | 'suggested'
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeShoppingGift, setActiveShoppingGift] = useState(null);

  // Load all gifts from either all recipients or selected recipient
  const loadGifts = async () => {
    setIsLoading(true);
    try {
      if (historyRecipientId === 'all') {
        const giftList = [];
        for (const r of recipients) {
          const res = await api.getRecipientHistory(r.id);
          res.all.forEach(g => giftList.push({ ...g, recipient_name: r.name }));
        }
        setAllGifts(giftList);
      } else {
        const res = await api.getRecipientHistory(historyRecipientId);
        const selectedRecipient = recipients.find(r => r.id === historyRecipientId);
        const giftList = res.all.map(g => ({
          ...g,
          recipient_name: selectedRecipient ? selectedRecipient.name : 'Recipient'
        }));
        setAllGifts(giftList);
      }
    } catch (err) {
      console.error('Failed to load gift history:', err);
      addToast('Failed to load gift history', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGifts();
  }, [historyRecipientId, recipients]);

  // Filtered gifts list
  const filteredGifts = useMemo(() => {
    return allGifts.filter((g) => {
      // Status filter
      if (activeStatusFilter !== 'all' && g.status !== activeStatusFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          g.name.toLowerCase().includes(q) ||
          g.category.toLowerCase().includes(q) ||
          g.reasoning.toLowerCase().includes(q) ||
          (g.recipient_name && g.recipient_name.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [allGifts, activeStatusFilter, searchQuery]);

  // Status Counts
  const counts = useMemo(() => {
    return {
      all: allGifts.length,
      saved: allGifts.filter(g => g.status === 'saved').length,
      bought: allGifts.filter(g => g.status === 'bought').length,
      archived: allGifts.filter(g => g.status === 'archived').length,
      suggested: allGifts.filter(g => g.status === 'suggested').length,
    };
  }, [allGifts]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-orange-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-brand-100 text-brand-700">
              <History className="w-5 h-5" />
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Gift History & Wishlist Tracker
            </h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Track suggested, saved, bought, and archived gifts across all your recipients
          </p>
        </div>

        {/* Export Action */}
        <ExportButton
          recipientName={
            historyRecipientId === 'all'
              ? 'All Recipients'
              : recipients.find(r => r.id === historyRecipientId)?.name || 'Recipient'
          }
          gifts={filteredGifts}
        />
      </div>

      {/* Control Filters Bar */}
      <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        
        {/* Recipient Dropdown Selector */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-600">Recipient:</span>
          <select
            value={historyRecipientId}
            onChange={(e) => setHistoryRecipientId(e.target.value)}
            className="text-xs font-semibold rounded-xl border border-slate-200 px-3 py-1.5 bg-slate-50 text-slate-800 outline-none focus:border-brand-500 cursor-pointer"
          >
            <option value="all">All Saved Recipients</option>
            {recipients.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.relationship || 'Recipient'})
              </option>
            ))}
          </select>
        </div>

        {/* Search Filter */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search gifts, categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:border-brand-500 outline-none"
          />
        </div>

      </div>

      {/* Status Filter Tabs */}
      <div className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveStatusFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeStatusFilter === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          All ({counts.all})
        </button>

        <button
          onClick={() => setActiveStatusFilter('saved')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeStatusFilter === 'saved'
              ? 'bg-brand-500 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-brand-50 hover:text-brand-700 border border-slate-200'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Saved Wishlist ({counts.saved})</span>
        </button>

        <button
          onClick={() => setActiveStatusFilter('bought')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeStatusFilter === 'bought'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Bought ({counts.bought})</span>
        </button>

        <button
          onClick={() => setActiveStatusFilter('archived')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeStatusFilter === 'archived'
              ? 'bg-slate-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Archive className="w-3.5 h-3.5" />
          <span>Archived ({counts.archived})</span>
        </button>

        <button
          onClick={() => setActiveStatusFilter('suggested')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeStatusFilter === 'suggested'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-700 border border-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Suggested ({counts.suggested})</span>
        </button>
      </div>

      {/* Gifts List / Table */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs">Loading gift history...</p>
        </div>
      ) : filteredGifts.length === 0 ? (
        <div className="mt-8 text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 p-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center mx-auto mb-3">
            <History className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg">No gifts found in this view</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            As you generate and interact with gift ideas, they are automatically organized here to avoid repeated recommendations.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGifts.map((g) => {
            const isSaved = g.status === 'saved';
            const isBought = g.status === 'bought';
            const isArchived = g.status === 'archived';

            return (
              <div
                key={g.id}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md">
                      For: {g.recipient_name}
                    </span>

                    {/* Current Status Pill */}
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        isBought
                          ? 'bg-emerald-100 text-emerald-800'
                          : isSaved
                          ? 'bg-amber-100 text-amber-800'
                          : isArchived
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {g.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-base leading-snug">{g.name}</h4>

                  <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-slate-600">
                    <span className="px-2 py-0.5 rounded bg-slate-100">{g.price_range}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500">{g.category}</span>
                  </div>

                  <p className="mt-3 text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {g.reasoning}
                  </p>
                </div>

                {/* Status Switcher Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-1 text-xs">
                  <span className="text-[11px] text-slate-400 font-medium">Set status:</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateGiftStatus(g, isSaved ? 'suggested' : 'saved')}
                      className={`px-2 py-1 rounded-lg text-[11px] font-semibold border ${
                        isSaved ? 'bg-brand-500 text-white' : 'bg-white hover:bg-slate-50 text-slate-600'
                      }`}
                      title="Toggle Saved Wishlist"
                    >
                      ★ Save
                    </button>
                    <button
                      onClick={() => updateGiftStatus(g, isBought ? 'suggested' : 'bought')}
                      className={`px-2 py-1 rounded-lg text-[11px] font-semibold border ${
                        isBought ? 'bg-emerald-600 text-white' : 'bg-white hover:bg-slate-50 text-slate-600'
                      }`}
                      title="Toggle Bought"
                    >
                      ✓ Bought
                    </button>
                    <button
                      onClick={() => updateGiftStatus(g, isArchived ? 'suggested' : 'archived')}
                      className={`px-2 py-1 rounded-lg text-[11px] font-semibold border ${
                        isArchived ? 'bg-slate-700 text-white' : 'bg-white hover:bg-slate-50 text-slate-400'
                      }`}
                      title="Toggle Archived"
                    >
                      Archive
                    </button>
                    <button
                      onClick={() => setActiveShoppingGift(g)}
                      className="px-2 py-1 rounded-lg text-[11px] font-bold bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 flex items-center gap-1 transition-colors"
                      title="Shop on Amazon, Flipkart, or Google"
                    >
                      <ShoppingCart className="w-3 h-3 text-brand-600" />
                      <span>Shop</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Shopping Platform Selector Modal */}
      <ShoppingModal
        isOpen={Boolean(activeShoppingGift)}
        onClose={() => setActiveShoppingGift(null)}
        gift={activeShoppingGift}
      />

    </div>
  );
}
