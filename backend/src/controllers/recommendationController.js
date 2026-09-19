import { generateRecommendations, refineRecommendations, getAiConfig } from '../services/aiService.js';
import { dbService } from '../services/dbService.js';
import { v4 as uuidv4 } from 'uuid';

export const recommendationController = {
  /**
   * POST /api/recommend-gifts
   */
  async recommendGifts(req, res) {
    try {
      const {
        description,
        name = '',
        relationship = '',
        age = '',
        budget = '',
        occasion = '',
        recipient_id = null,
        excluded_gifts = []
      } = req.body;

      if (!description || typeof description !== 'string' || !description.trim()) {
        return res.status(400).json({ error: 'Recipient description is required.' });
      }

      // Collect past gifts to exclude if recipient_id exists
      let pastGifts = [];
      let activeRecipientId = recipient_id;

      if (activeRecipientId) {
        const history = await dbService.getGiftHistory(activeRecipientId);
        pastGifts = history.all.map(g => g.name);
      }

      let result = await generateRecommendations({
        description: description.trim(),
        name: name.trim(),
        relationship: relationship.trim(),
        age: age.trim(),
        budget: budget.trim(),
        occasion: occasion.trim(),
        excludedGifts: Array.isArray(excluded_gifts) ? excluded_gifts : [],
        pastGifts
      });

      // --- SEMANTIC DEDUPLICATION ---
      const { filterSemanticDuplicates } = await import('../services/embeddingService.js');
      const deduplicatedGifts = await filterSemanticDuplicates(result.gifts, pastGifts);
      result.gifts = deduplicatedGifts;
      // -----------------------------

      // If user provided a name or we have an active recipient, persist or update
      if (!activeRecipientId && name.trim()) {
        const newRecipient = await dbService.createRecipient({
          name: name.trim(),
          relationship: relationship.trim(),
          description: description.trim(),
          age: age.trim(),
          budget: budget.trim(),
          occasion: occasion.trim()
        });
        activeRecipientId = newRecipient.id;
      }

      // Persist suggested gifts to database if recipient exists
      let savedGifts = result.gifts;
      if (activeRecipientId) {
        const batchId = uuidv4();
        savedGifts = await dbService.saveGifts(activeRecipientId, result.gifts, batchId);

        // Record conversation message
        await dbService.saveConversationMessage(activeRecipientId, 'user', description);
        await dbService.saveConversationMessage(activeRecipientId, 'assistant', result.recipient_summary, {
          batch_id: batchId,
          gifts_count: savedGifts.length
        });
      }

      return res.json({
        recipient_id: activeRecipientId,
        recipient_summary: result.recipient_summary,
        gifts: savedGifts,
        is_demo_mode: result.isDemoMode,
        demo_reason: result.demoReason || null,
        provider: result.provider,
        source: result.source || (result.isDemoMode ? 'fallback' : 'ai')
      });
    } catch (err) {
      console.error('Error in recommendGifts controller:', err);
      return res.status(500).json({ error: 'Failed to generate recommendations.', details: err.message });
    }
  },

  /**
   * POST /api/refine-gifts
   */
  async refineGifts(req, res) {
    try {
      const {
        recipient_id = null,
        recipient_info = {},
        previous_recommendations = [],
        conversation_history = [],
        user_refinement = '',
        excluded_gifts = [],
        past_gifts = []
      } = req.body;

      if (!user_refinement || typeof user_refinement !== 'string' || !user_refinement.trim()) {
        return res.status(400).json({ error: 'User refinement text is required.' });
      }

      let allPastGifts = [...past_gifts];
      if (recipient_id) {
        const history = await dbService.getGiftHistory(recipient_id);
        const historyNames = history.all.map(g => g.name);
        allPastGifts = [...new Set([...allPastGifts, ...historyNames])];
      }

      let result = await refineRecommendations({
        recipientInfo: recipient_info,
        conversationHistory: conversation_history,
        previousRecommendations: previous_recommendations,
        userRefinement: user_refinement.trim(),
        excludedGifts: Array.isArray(excluded_gifts) ? excluded_gifts : [],
        pastGifts: allPastGifts
      });

      // --- SEMANTIC DEDUPLICATION ---
      const { filterSemanticDuplicates } = await import('../services/embeddingService.js');
      const deduplicatedGifts = await filterSemanticDuplicates(result.gifts, allPastGifts);
      result.gifts = deduplicatedGifts;
      // -----------------------------

      let savedGifts = result.gifts;
      if (recipient_id) {
        const batchId = uuidv4();
        savedGifts = await dbService.saveGifts(recipient_id, result.gifts, batchId);

        await dbService.saveConversationMessage(recipient_id, 'user', user_refinement);
        await dbService.saveConversationMessage(recipient_id, 'assistant', result.recipient_summary, {
          batch_id: batchId,
          gifts_count: savedGifts.length
        });
      }

      return res.json({
        recipient_id,
        recipient_summary: result.recipient_summary,
        gifts: savedGifts,
        is_demo_mode: result.isDemoMode,
        demo_reason: result.demoReason || null,
        provider: result.provider,
        source: result.source || (result.isDemoMode ? 'fallback' : 'ai')
      });
    } catch (err) {
      console.error('Error in refineGifts controller:', err);
      return res.status(500).json({ error: 'Failed to refine recommendations.', details: err.message });
    }
  },

  /**
   * GET /api/ai-status
   */
  getAiStatus(req, res) {
    const config = getAiConfig();
    return res.json({
      is_live: config.isLive,
      provider: config.provider,
      mode: config.isLive ? 'Live AI Mode' : 'Demo / Heuristic Fallback Mode'
    });
  }
};
