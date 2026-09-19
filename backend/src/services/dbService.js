import { v4 as uuidv4 } from 'uuid';
import { getDatabase, saveDatabase } from '../config/database.js';

/**
 * Executes a query that returns multiple rows as plain objects
 */
async function queryAll(sql, params = []) {
  const db = await getDatabase();
  const stmt = db.prepare(sql);
  try {
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    return rows;
  } finally {
    stmt.free();
  }
}

/**
 * Executes a query that returns a single row as an object, or null
 */
async function queryOne(sql, params = []) {
  const rows = await queryAll(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * Executes a run query (INSERT, UPDATE, DELETE) and persists to disk
 */
async function runQuery(sql, params = []) {
  const db = await getDatabase();
  db.run(sql, params);
  saveDatabase();
}

export const dbService = {
  // ================= RECIPIENTS =================

  async createRecipient({ name, relationship = '', description = '', age = '', budget = '', occasion = '' }) {
    const id = uuidv4();
    const now = new Date().toISOString();

    await runQuery(
      `INSERT INTO recipients (id, name, relationship, description, age, budget, occasion, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name.trim(), relationship.trim(), description.trim(), age.trim(), budget.trim(), occasion.trim(), now, now]
    );

    return this.getRecipientById(id);
  },

  async getAllRecipients() {
    const sql = `
      SELECT 
        r.*,
        COUNT(g.id) as total_gifts,
        SUM(CASE WHEN g.status = 'saved' THEN 1 ELSE 0 END) as saved_gifts_count,
        SUM(CASE WHEN g.status = 'bought' THEN 1 ELSE 0 END) as bought_gifts_count,
        SUM(CASE WHEN g.status = 'archived' THEN 1 ELSE 0 END) as archived_gifts_count,
        MAX(g.created_at) as last_recommendation_date
      FROM recipients r
      LEFT JOIN gifts g ON r.id = g.recipient_id
      GROUP BY r.id
      ORDER BY r.updated_at DESC
    `;
    const rows = await queryAll(sql);
    return rows.map(r => ({
      ...r,
      total_gifts: Number(r.total_gifts || 0),
      saved_gifts_count: Number(r.saved_gifts_count || 0),
      bought_gifts_count: Number(r.bought_gifts_count || 0),
      archived_gifts_count: Number(r.archived_gifts_count || 0),
    }));
  },

  async getRecipientById(id) {
    const recipient = await queryOne(`SELECT * FROM recipients WHERE id = ?`, [id]);
    if (!recipient) return null;

    const gifts = await queryAll(
      `SELECT * FROM gifts WHERE recipient_id = ? ORDER BY rank ASC, created_at DESC`,
      [id]
    );

    const conversations = await queryAll(
      `SELECT * FROM conversations WHERE recipient_id = ? ORDER BY created_at ASC`,
      [id]
    );

    return {
      ...recipient,
      gifts,
      conversations: conversations.map(c => ({
        ...c,
        metadata: c.metadata ? JSON.parse(c.metadata) : null
      }))
    };
  },

  async updateRecipient(id, fields = {}) {
    const existing = await queryOne(`SELECT * FROM recipients WHERE id = ?`, [id]);
    if (!existing) return null;

    const now = new Date().toISOString();
    const updated = {
      name: fields.name !== undefined ? fields.name.trim() : existing.name,
      relationship: fields.relationship !== undefined ? fields.relationship.trim() : existing.relationship,
      description: fields.description !== undefined ? fields.description.trim() : existing.description,
      age: fields.age !== undefined ? fields.age.trim() : existing.age,
      budget: fields.budget !== undefined ? fields.budget.trim() : existing.budget,
      occasion: fields.occasion !== undefined ? fields.occasion.trim() : existing.occasion,
    };

    await runQuery(
      `UPDATE recipients
       SET name = ?, relationship = ?, description = ?, age = ?, budget = ?, occasion = ?, updated_at = ?
       WHERE id = ?`,
      [updated.name, updated.relationship, updated.description, updated.age, updated.budget, updated.occasion, now, id]
    );

    return this.getRecipientById(id);
  },

  async deleteRecipient(id) {
    await runQuery(`DELETE FROM gifts WHERE recipient_id = ?`, [id]);
    await runQuery(`DELETE FROM conversations WHERE recipient_id = ?`, [id]);
    await runQuery(`DELETE FROM recipients WHERE id = ?`, [id]);
    return true;
  },

  // ================= GIFTS =================

  async saveGifts(recipientId, giftsList, batchId = uuidv4()) {
    const now = new Date().toISOString();
    const saved = [];

    for (const g of giftsList) {
      const id = g.id || uuidv4();
      const status = g.status || 'suggested';
      const rank = g.rank || (saved.length + 1);

      await runQuery(
        `INSERT INTO gifts (id, recipient_id, name, price_range, category, reasoning, match_score, rank, status, batch_id, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          recipientId,
          g.name,
          g.price_range || '$20-$50',
          g.category || 'General',
          g.reasoning || '',
          g.match_score || 90,
          rank,
          status,
          batchId,
          now,
          now
        ]
      );

      saved.push({
        id,
        recipient_id: recipientId,
        name: g.name,
        price_range: g.price_range,
        category: g.category,
        reasoning: g.reasoning,
        match_score: g.match_score,
        rank,
        status,
        batch_id: batchId,
        created_at: now,
        updated_at: now
      });
    }

    // Update recipient updated_at
    if (recipientId) {
      await runQuery(`UPDATE recipients SET updated_at = ? WHERE id = ?`, [now, recipientId]);
    }

    return saved;
  },

  async updateGiftStatus(giftId, status) {
    const validStatuses = ['suggested', 'saved', 'bought', 'archived'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`);
    }

    const now = new Date().toISOString();
    await runQuery(
      `UPDATE gifts SET status = ?, updated_at = ? WHERE id = ?`,
      [status, now, giftId]
    );

    const gift = await queryOne(`SELECT * FROM gifts WHERE id = ?`, [giftId]);
    return gift;
  },

  async getGiftHistory(recipientId) {
    const gifts = await queryAll(
      `SELECT * FROM gifts WHERE recipient_id = ? ORDER BY created_at DESC, rank ASC`,
      [recipientId]
    );

    return {
      all: gifts,
      suggested: gifts.filter(g => g.status === 'suggested'),
      saved: gifts.filter(g => g.status === 'saved'),
      bought: gifts.filter(g => g.status === 'bought'),
      archived: gifts.filter(g => g.status === 'archived'),
    };
  },

  // ================= CONVERSATIONS =================

  async saveConversationMessage(recipientId, role, content, metadata = null) {
    const id = uuidv4();
    const now = new Date().toISOString();
    const metadataStr = metadata ? JSON.stringify(metadata) : null;

    await runQuery(
      `INSERT INTO conversations (id, recipient_id, role, content, metadata, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, recipientId, role, content, metadataStr, now]
    );

    return { id, recipient_id: recipientId, role, content, metadata, created_at: now };
  },

  async getConversations(recipientId) {
    const rows = await queryAll(
      `SELECT * FROM conversations WHERE recipient_id = ? ORDER BY created_at ASC`,
      [recipientId]
    );

    return rows.map(r => ({
      ...r,
      metadata: r.metadata ? JSON.parse(r.metadata) : null
    }));
  },

  // ================= SHOPPING CLICKS =================

  async logShoppingClick({ giftId = null, giftName, platform }) {
    const id = uuidv4();
    const now = new Date().toISOString();

    await runQuery(
      `INSERT INTO shopping_clicks (id, gift_id, gift_name, platform, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [id, giftId, (giftName || 'Unknown Gift').trim(), (platform || 'unknown').trim(), now]
    );

    return { id, gift_id: giftId, gift_name: giftName, platform, created_at: now };
  },

  async getShoppingClicks() {
    return queryAll(`SELECT * FROM shopping_clicks ORDER BY created_at DESC LIMIT 100`);
  }
};
