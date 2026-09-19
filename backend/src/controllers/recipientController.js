import { dbService } from '../services/dbService.js';

export const recipientController = {
  /**
   * POST /api/recipients
   */
  async createRecipient(req, res) {
    try {
      const { name, relationship, description, age, budget, occasion } = req.body;
      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: 'Recipient name is required.' });
      }

      const userId = req.user ? req.user.id : null;

      const recipient = await dbService.createRecipient({
        name,
        relationship,
        description,
        age,
        budget,
        occasion,
        userId
      });

      return res.status(201).json(recipient);
    } catch (err) {
      console.error('Error creating recipient:', err);
      return res.status(500).json({ error: 'Failed to create recipient profile.' });
    }
  },

  /**
   * GET /api/recipients
   */
  async getRecipients(req, res) {
    try {
      const { page, limit } = req.query;
      const userId = req.user ? req.user.id : null;

      if (page || limit) {
        const paginated = await dbService.getPaginatedRecipients({ page, limit, userId });
        return res.json(paginated);
      }

      const recipients = await dbService.getAllRecipients(userId);
      return res.json(recipients);
    } catch (err) {
      console.error('Error fetching recipients:', err);
      return res.status(500).json({ error: 'Failed to fetch recipient profiles.' });
    }
  },

  /**
   * GET /api/recipients/:id
   */
  async getRecipientById(req, res) {
    try {
      const { id } = req.params;
      const recipient = await dbService.getRecipientById(id);
      if (!recipient) {
        return res.status(404).json({ error: 'Recipient not found.' });
      }
      return res.json(recipient);
    } catch (err) {
      console.error('Error fetching recipient by id:', err);
      return res.status(500).json({ error: 'Failed to fetch recipient details.' });
    }
  },

  /**
   * PUT /api/recipients/:id
   */
  async updateRecipient(req, res) {
    try {
      const { id } = req.params;
      const updated = await dbService.updateRecipient(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Recipient not found.' });
      }
      return res.json(updated);
    } catch (err) {
      console.error('Error updating recipient:', err);
      return res.status(500).json({ error: 'Failed to update recipient profile.' });
    }
  },

  /**
   * DELETE /api/recipients/:id
   */
  async deleteRecipient(req, res) {
    try {
      const { id } = req.params;
      await dbService.deleteRecipient(id);
      return res.json({ success: true, message: 'Recipient profile deleted successfully.' });
    } catch (err) {
      console.error('Error deleting recipient:', err);
      return res.status(500).json({ error: 'Failed to delete recipient profile.' });
    }
  }
};
