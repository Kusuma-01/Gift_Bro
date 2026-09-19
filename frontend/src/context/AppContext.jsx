import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import confetti from 'canvas-confetti';

const AppContext = createContext();

export function AppProvider({ children }) {
  // Navigation & UI state
  const [activeTab, setActiveTab] = useState('generator'); // 'generator' | 'recipients' | 'history'
  const [aiStatus, setAiStatus] = useState({ is_live: false, mode: 'Loading...', provider: 'mock' });
  const [toasts, setToasts] = useState([]);

  // Recipient profiles
  const [recipients, setRecipients] = useState([]);
  const [activeRecipient, setActiveRecipient] = useState(null);
  const [isProfilesLoading, setIsProfilesLoading] = useState(false);

  // Recommendations & conversation
  const [recommendations, setRecommendations] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form input state (for generator pre-filling or syncing)
  const [inputForm, setInputForm] = useState({
    description: '',
    name: '',
    relationship: '',
    occasion: '',
    budget: '',
    age: '',
  });

  // Selected history recipient filter
  const [historyRecipientId, setHistoryRecipientId] = useState('all');

  // Toast helper
  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Fetch AI status and Recipients
  const fetchAiStatus = async () => {
    try {
      const status = await api.getAiStatus();
      setAiStatus(status);
    } catch (err) {
      setAiStatus({ is_live: false, mode: 'Demo / Fallback Mode (Offline)', provider: 'fallback' });
    }
  };

  const fetchRecipients = useCallback(async () => {
    setIsProfilesLoading(true);
    try {
      const list = await api.getRecipients();
      setRecipients(list);
    } catch (err) {
      console.error('Failed to load recipients:', err);
    } finally {
      setIsProfilesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAiStatus();
    fetchRecipients();
  }, [fetchRecipients]);

  // Load a recipient into the generator
  const loadRecipientIntoGenerator = async (recipient) => {
    setActiveRecipient(recipient);
    setInputForm({
      description: recipient.description || '',
      name: recipient.name || '',
      relationship: recipient.relationship || '',
      occasion: recipient.occasion || '',
      budget: recipient.budget || '',
      age: recipient.age || '',
    });
    setActiveTab('generator');

    // If recipient has previous recommendations, populate them
    if (recipient.id) {
      try {
        const full = await api.getRecipientById(recipient.id);
        if (full.gifts && full.gifts.length > 0) {
          setRecommendations({
            recipient_summary: `Saved profile for ${full.name} (${full.relationship || 'Recipient'}).`,
            gifts: full.gifts,
            recipient_id: full.id,
            is_demo_mode: !aiStatus.is_live,
          });
        }
        if (full.conversations && full.conversations.length > 0) {
          setConversationHistory(full.conversations);
        }
      } catch (err) {
        console.error('Error fetching full recipient details:', err);
      }
    }

    addToast(`Loaded profile for ${recipient.name}`, 'info');
  };

  // Generate initial recommendations
  const generateGiftIdeas = async (formData) => {
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        description: formData.description,
        name: formData.name,
        relationship: formData.relationship,
        age: formData.age,
        budget: formData.budget,
        occasion: formData.occasion,
        recipient_id: activeRecipient ? activeRecipient.id : null,
      };

      const result = await api.recommendGifts(payload);

      setRecommendations(result);
      setConversationHistory([
        { role: 'user', content: formData.description },
        { role: 'assistant', content: result.recipient_summary }
      ]);

      // If a recipient ID was returned, refresh recipients list
      if (result.recipient_id) {
        await fetchRecipients();
      }

      addToast(`Generated ${result.gifts.length} personalized gift recommendations!`, 'success');
    } catch (err) {
      setError(err.message || 'Failed to generate recommendations. Please try again.');
      addToast(err.message || 'Error generating recommendations', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Refine recommendations conversationally
  const refineGiftIdeas = async (refinementText) => {
    if (!refinementText || !refinementText.trim()) return;

    setIsLoading(true);
    setError(null);

    // Append user's refinement to local chat immediately for responsive UX
    const updatedChat = [...conversationHistory, { role: 'user', content: refinementText }];
    setConversationHistory(updatedChat);

    try {
      const payload = {
        recipient_id: activeRecipient?.id || recommendations?.recipient_id || null,
        recipient_info: {
          description: inputForm.description,
          name: inputForm.name,
          relationship: inputForm.relationship,
          age: inputForm.age,
          budget: inputForm.budget,
          occasion: inputForm.occasion,
        },
        previous_recommendations: recommendations ? recommendations.gifts : [],
        conversation_history: updatedChat,
        user_refinement: refinementText,
        past_gifts: [],
      };

      const result = await api.refineGifts(payload);

      setRecommendations(result);
      setConversationHistory([
        ...updatedChat,
        { role: 'assistant', content: result.recipient_summary }
      ]);

      if (result.recipient_id) {
        await fetchRecipients();
      }

      addToast('Recommendations updated with your constraints!', 'success');
    } catch (err) {
      setError(err.message || 'Failed to refine recommendations.');
      addToast(err.message || 'Failed to refine recommendations', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Update gift status (saved, bought, archived, suggested)
  const updateGiftStatus = async (gift, newStatus) => {
    try {
      // Confetti effect when marking as bought!
      if (newStatus === 'bought') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.7 }
        });
      }

      // Optimistic update for recommendations view
      if (recommendations && recommendations.gifts) {
        setRecommendations({
          ...recommendations,
          gifts: recommendations.gifts.map(g =>
            g.name === gift.name || (g.id && g.id === gift.id)
              ? { ...g, status: newStatus }
              : g
          ),
        });
      }

      // If gift already has a database ID, update directly
      if (gift.id) {
        await api.updateGiftStatus(gift.id, newStatus);
      } else if (activeRecipient?.id || recommendations?.recipient_id) {
        // Save as a new gift with this status for this recipient
        const recId = activeRecipient?.id || recommendations?.recipient_id;
        await api.saveRecipientGift(recId, {
          ...gift,
          status: newStatus,
        });
      }

      const statusLabels = {
        saved: 'Saved to wishlist',
        bought: 'Marked as Bought! 🎁',
        archived: 'Moved to archive',
        suggested: 'Marked as suggested',
      };

      addToast(`${gift.name} -> ${statusLabels[newStatus]}`, 'success');
      await fetchRecipients();
    } catch (err) {
      console.error('Failed to update gift status:', err);
      addToast('Failed to update gift status', 'error');
    }
  };

  // Pre-fill sample test cases
  const loadSampleCase = (sampleCase) => {
    setInputForm({
      description: sampleCase.description,
      name: sampleCase.name || '',
      relationship: sampleCase.relationship || '',
      occasion: sampleCase.occasion || '',
      budget: sampleCase.budget || '',
      age: sampleCase.age || '',
    });
    setActiveRecipient(null);
    setRecommendations(null);
    setConversationHistory([]);
    setActiveTab('generator');
    addToast(`Loaded sample scenario: ${sampleCase.label}`, 'info');
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        aiStatus,
        toasts,
        addToast,
        removeToast,
        recipients,
        fetchRecipients,
        activeRecipient,
        setActiveRecipient,
        isProfilesLoading,
        recommendations,
        setRecommendations,
        conversationHistory,
        isLoading,
        error,
        setError,
        inputForm,
        setInputForm,
        historyRecipientId,
        setHistoryRecipientId,
        generateGiftIdeas,
        refineGiftIdeas,
        updateGiftStatus,
        loadRecipientIntoGenerator,
        loadSampleCase,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
