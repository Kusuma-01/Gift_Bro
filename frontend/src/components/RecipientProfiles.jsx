import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Users, Sparkles, History, Edit3, Trash2, Plus, Calendar, DollarSign, Heart, Gift, ShoppingBag, Bookmark, Archive } from 'lucide-react';
import { api } from '../services/api';

export default function RecipientProfiles() {
  const {
    recipients,
    fetchRecipients,
    loadRecipientIntoGenerator,
    setActiveTab,
    setHistoryRecipientId,
    addToast
  } = useApp();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRecipient, setEditingRecipient] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    description: '',
    budget: '',
    age: '',
    occasion: ''
  });

  const handleOpenCreate = () => {
    setFormData({ name: '', relationship: '', description: '', budget: '', age: '', occasion: '' });
    setEditingRecipient(null);
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (recipient) => {
    setFormData({
      name: recipient.name || '',
      relationship: recipient.relationship || '',
      description: recipient.description || '',
      budget: recipient.budget || '',
      age: recipient.age || '',
      occasion: recipient.occasion || ''
    });
    setEditingRecipient(recipient);
    setIsCreateModalOpen(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      if (editingRecipient) {
        await api.updateRecipient(editingRecipient.id, formData);
        addToast(`Updated profile for ${formData.name}`, 'success');
      } else {
        await api.createRecipient(formData);
        addToast(`Created profile for ${formData.name}`, 'success');
      }
      setIsCreateModalOpen(false);
      await fetchRecipients();
    } catch (err) {
      console.error('Failed to save profile:', err);
      addToast(err.message || 'Failed to save recipient profile', 'error');
    }
  };

  const handleDeleteProfile = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete profile for "${name}"?`)) return;

    try {
      await api.deleteRecipient(id);
      addToast(`Deleted profile for ${name}`, 'info');
      await fetchRecipients();
    } catch (err) {
      console.error('Failed to delete recipient:', err);
      addToast('Failed to delete recipient', 'error');
    }
  };

  const handleViewHistory = (recipientId) => {
    setHistoryRecipientId(recipientId);
    setActiveTab('history');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-orange-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-brand-100 text-brand-700">
              <Users className="w-5 h-5" />
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Saved Recipient Profiles
            </h2>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Manage your people, their recurring tastes, budgets, and historical gifts
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Recipient</span>
        </button>
      </div>

      {/* Profiles Grid */}
      {recipients.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 mt-8 p-8">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg">No saved recipient profiles yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-5">
            Profiles let GiftBro AI remember personal tastes, avoid gifts you've already bought, and track recommendations over time.
          </p>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-brand-500 text-white text-xs font-semibold hover:bg-brand-600 transition-all"
          >
            Create Your First Profile
          </button>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipients.map((r) => {
            const formattedDate = r.last_recommendation_date
              ? new Date(r.last_recommendation_date).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Never';

            return (
              <div
                key={r.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Avatar & Name */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-400 to-rose-400 text-white flex items-center justify-center font-extrabold text-base shadow-xs">
                        {r.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{r.name}</h3>
                        <span className="inline-block text-[11px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md mt-0.5">
                          {r.relationship || 'Friend / Family'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-slate-400">
                      <button
                        onClick={() => handleOpenEdit(r)}
                        className="p-1.5 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit profile"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProfile(r.id, r.name)}
                        className="p-1.5 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete profile"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Description */}
                  {r.description && (
                    <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      "{r.description}"
                    </p>
                  )}

                  {/* Metadata Stats */}
                  <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                      <span>Budget: <strong>{r.budget || 'Any'}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Last: <strong>{formattedDate}</strong></span>
                    </div>
                  </div>

                  {/* Gift Counts Badges */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      <Bookmark className="w-3 h-3" /> {r.saved_gifts_count} Saved
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <ShoppingBag className="w-3 h-3" /> {r.bought_gifts_count} Bought
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-600">
                      <Archive className="w-3 h-3" /> {r.archived_gifts_count}
                    </span>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => loadRecipientIntoGenerator(r)}
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-brand-600 to-orange-500 hover:from-brand-500 hover:to-orange-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate New Ideas</span>
                  </button>

                  <button
                    onClick={() => handleViewHistory(r.id)}
                    className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1 transition-colors"
                    title="View past gift recommendations"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>History</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Modal for Creating / Editing Profile */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {editingRecipient ? `Edit Profile: ${editingRecipient.name}` : 'Create Recipient Profile'}
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Mom, Alex, David"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Relationship</label>
                  <input
                    type="text"
                    value={formData.relationship}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    placeholder="e.g. Brother, Best Friend"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Budget</label>
                  <input
                    type="text"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    placeholder="e.g. $50-80"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Personality & Preferences</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tell GiftBro about their interests, hobbies, quirks, and things they already have..."
                  className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Age</label>
                  <input
                    type="text"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    placeholder="e.g. 28, 62"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Default Occasion</label>
                  <input
                    type="text"
                    value={formData.occasion}
                    onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                    placeholder="e.g. Birthday, Christmas"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold shadow-xs"
                >
                  {editingRecipient ? 'Update Profile' : 'Create Profile'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
