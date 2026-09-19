import React, { useState } from 'react';
import { SHOPPING_PLATFORMS, getShoppingUrl } from '../services/shoppingService';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import { X, ExternalLink, ShoppingCart, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function ShoppingModal({ isOpen, onClose, gift }) {
  const { addToast } = useApp();
  const [selectedPlatform, setSelectedPlatform] = useState('amazon');
  const [errorMessage, setErrorMessage] = useState(null);

  if (!isOpen || !gift) return null;

  const giftName = gift.name || 'Gift';
  const priceRange = gift.price_range || '';

  const handleOpenPlatform = (platformId) => {
    setErrorMessage(null);
    try {
      const url = getShoppingUrl(platformId, gift);

      // Track anonymous shopping click in background
      api.trackShoppingClick({
        gift_id: gift.id || null,
        gift_name: gift.name,
        platform: platformId,
      });

      // Safely open in new browser tab
      window.open(url, '_blank', 'noopener,noreferrer');
      addToast(`Opening ${giftName} on ${platformId.charAt(0).toUpperCase() + platformId.slice(1)}...`, 'info');
      onClose();
    } catch (err) {
      console.error('Shopping URL error:', err);
      const msg = err.message || 'Unable to create shopping search.';
      setErrorMessage(msg);
      addToast(msg, 'error');
    }
  };

  const handleContinue = () => {
    handleOpenPlatform(selectedPlatform);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-500 to-rose-500 text-white flex items-center justify-center shadow-xs">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-lg tracking-tight">
              Where would you like to shop?
            </h3>
            <p className="text-xs text-slate-500">
              Find live prices and availability for this gift
            </p>
          </div>
        </div>

        {/* Gift Summary Box */}
        <div className="p-3.5 rounded-2xl bg-brand-50/70 border border-brand-100 mb-5 text-xs text-slate-700">
          <div className="font-bold text-slate-900 text-sm line-clamp-1 mb-0.5">
            {giftName}
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Category: <strong className="text-slate-700">{gift.category || 'General'}</strong></span>
            {priceRange && (
              <span>Estimated: <strong className="text-brand-800">{priceRange}</strong></span>
            )}
          </div>
        </div>

        {/* Error message banner if any */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Platform Selection Options */}
        <div className="space-y-2.5 mb-6">
          {SHOPPING_PLATFORMS.map((platform) => {
            const isSelected = selectedPlatform === platform.id;

            return (
              <div
                key={platform.id}
                onClick={() => setSelectedPlatform(platform.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                  isSelected
                    ? 'border-brand-500 bg-brand-50/40 ring-2 ring-brand-100'
                    : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{platform.icon}</div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 text-sm">{platform.name}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-slate-100 text-slate-600">
                        {platform.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{platform.tagline}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenPlatform(platform.id);
                    }}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-brand-500 hover:text-white text-slate-600 transition-all shadow-xs"
                    title={`Open on ${platform.name}`}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Notice on Estimated Pricing & Merchant Data */}
        <div className="mb-6 flex items-start gap-2 text-[11px] text-slate-400 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p>
            Searches open directly on the retailer's official website in a new tab. Live inventory and actual store pricing will be displayed there.
          </p>
        </div>

        {/* Actions Footer */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs sm:text-sm font-semibold transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleContinue}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-orange-500 hover:from-brand-500 hover:to-orange-400 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all"
          >
            <span>Continue to Store</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
