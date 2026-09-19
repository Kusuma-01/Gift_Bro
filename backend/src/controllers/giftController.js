import { dbService } from '../services/dbService.js';

export const giftController = {
  /**
   * POST /api/recipients/:id/gifts
   * Save a gift recommendation/history item
   */
  async saveRecipientGift(req, res) {
    try {
      const { id } = req.params;
      const { name, price_range, category, reasoning, match_score, rank, status } = req.body;

      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: 'Gift name is required.' });
      }

      const gifts = await dbService.saveGifts(id, [
        {
          name: name.trim(),
          price_range: price_range || '$20-$50',
          category: category || 'General',
          reasoning: reasoning || '',
          match_score: match_score || 90,
          rank: rank || 1,
          status: status || 'saved'
        }
      ]);

      return res.status(201).json(gifts[0]);
    } catch (err) {
      console.error('Error saving recipient gift:', err);
      return res.status(500).json({ error: 'Failed to save gift item.' });
    }
  },

  /**
   * PUT /api/gifts/:id/status
   * Allow: bought, archived, saved, suggested
   */
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !['bought', 'archived', 'saved', 'suggested'].includes(status)) {
        return res.status(400).json({
          error: 'Invalid status. Must be one of: bought, archived, saved, suggested.'
        });
      }

      const updated = await dbService.updateGiftStatus(id, status);
      if (!updated) {
        return res.status(404).json({ error: 'Gift item not found.' });
      }

      return res.json(updated);
    } catch (err) {
      console.error('Error updating gift status:', err);
      return res.status(500).json({ error: 'Failed to update gift status.' });
    }
  },

  /**
   * GET /api/recipients/:id/history
   * Return previously suggested/bought/archived/saved gifts
   */
  async getRecipientHistory(req, res) {
    try {
      const { id } = req.params;
      const history = await dbService.getGiftHistory(id);
      return res.json(history);
    } catch (err) {
      console.error('Error fetching recipient history:', err);
      return res.status(500).json({ error: 'Failed to fetch gift history.' });
    }
  }
};
