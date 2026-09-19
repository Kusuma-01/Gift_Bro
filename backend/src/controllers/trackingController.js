import { dbService } from '../services/dbService.js';

export const trackingController = {
  /**
   * POST /api/tracking/shopping-click
   * Records an anonymous shopping click event for analytics
   */
  async logShoppingClick(req, res) {
    try {
      const { gift_id, gift_name, platform } = req.body;

      if (!platform || typeof platform !== 'string') {
        return res.status(400).json({ error: 'Platform is required.' });
      }

      const record = await dbService.logShoppingClick({
        giftId: gift_id || null,
        giftName: gift_name || 'Gift Search',
        platform: platform.toLowerCase().trim()
      });

      return res.status(201).json({
        success: true,
        tracked_id: record.id,
        timestamp: record.created_at
      });
    } catch (err) {
      console.error('Error logging shopping click:', err);
      // We do not fail hard for analytics
      return res.status(500).json({ error: 'Failed to record shopping click.', details: err.message });
    }
  },

  /**
   * GET /api/tracking/shopping-clicks
   */
  async getShoppingClicks(req, res) {
    try {
      const clicks = await dbService.getShoppingClicks();
      return res.json(clicks);
    } catch (err) {
      console.error('Error fetching shopping clicks:', err);
      return res.status(500).json({ error: 'Failed to fetch shopping clicks.' });
    }
  }
};
