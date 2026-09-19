import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { getDatabase, saveDatabase } from '../config/database.js';

/**
 * Normalizes string input (trims, collapses whitespace, lowers case)
 */
function normalizeString(str) {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/\s+/g, ' ').toLowerCase();
}

/**
 * Normalizes array of items (strings or objects with name)
 */
function normalizeArray(arr) {
  if (!Array.isArray(arr)) return [];
  return arr
    .map(item => {
      if (typeof item === 'string') return normalizeString(item);
      if (item && typeof item === 'object' && item.name) return normalizeString(item.name);
      return '';
    })
    .filter(Boolean)
    .sort();
}

/**
 * Normalizes conversation history array
 */
function normalizeConversationHistory(history) {
  if (!Array.isArray(history)) return [];
  return history.map(msg => ({
    role: normalizeString(msg.role || ''),
    content: normalizeString(msg.content || '')
  }));
}

/**
 * Normalizes previous recommendations array
 */
function normalizePreviousRecommendations(recs) {
  if (!Array.isArray(recs)) return [];
  return recs.map(rec => ({
    name: normalizeString(rec.name || ''),
    category: normalizeString(rec.category || ''),
    price_range: normalizeString(rec.price_range || '')
  })).sort((a, b) => a.name.localeCompare(b.name));
}

export const cacheService = {
  /**
   * Generates a deterministic SHA-256 cache key from normalized recommendation inputs
   */
  generateCacheKey(params) {
    const {
      requestType = 'initial',
      description = '',
      name = '',
      relationship = '',
      age = '',
      budget = '',
      occasion = '',
      excludedGifts = [],
      pastGifts = [],
      recipientInfo = {},
      conversationHistory = [],
      previousRecommendations = [],
      userRefinement = '',
      provider = 'gemini',
      model = 'default'
    } = params;

    const normalized = {
      type: normalizeString(requestType),
      provider: normalizeString(provider),
      model: normalizeString(model),
      description: normalizeString(description || recipientInfo.description),
      name: normalizeString(name || recipientInfo.name),
      relationship: normalizeString(relationship || recipientInfo.relationship),
      age: normalizeString(age || recipientInfo.age),
      budget: normalizeString(budget || recipientInfo.budget),
      occasion: normalizeString(occasion || recipientInfo.occasion),
      userRefinement: normalizeString(userRefinement),
      excludedGifts: normalizeArray(excludedGifts),
      pastGifts: normalizeArray(pastGifts),
      conversationHistory: normalizeConversationHistory(conversationHistory),
      previousRecommendations: normalizePreviousRecommendations(previousRecommendations)
    };

    const hashInput = JSON.stringify(normalized);
    return crypto.createHash('sha256').update(hashInput).digest('hex');
  },

  /**
   * Gets a valid cached AI response if available and not expired
   */
  async getCachedResponse(cacheKey, provider, model) {
    if (!cacheKey) return null;

    try {
      const db = await getDatabase();
      const stmt = db.prepare(
        `SELECT * FROM ai_response_cache WHERE cache_key = ?`
      );
      
      let row = null;
      try {
        stmt.bind([cacheKey]);
        if (stmt.step()) {
          row = stmt.getAsObject();
        }
      } finally {
        stmt.free();
      }

      if (!row) return null;

      // Check TTL expiry
      const now = new Date().toISOString();
      if (row.expires_at && row.expires_at <= now) {
        // Expired — delete expired row asynchronously and return null
        this.deleteCacheKey(cacheKey).catch(() => {});
        return null;
      }

      // Provider & model isolation check
      if (normalizeString(row.provider) !== normalizeString(provider) ||
          normalizeString(row.model) !== normalizeString(model)) {
        return null;
      }

      const parsedData = JSON.parse(row.response_json);
      return {
        ...parsedData,
        source: 'cache'
      };
    } catch (err) {
      console.warn('Cache lookup failed, proceeding without cache:', err.message);
      return null;
    }
  },

  /**
   * Caches a successful live AI response
   */
  async setCachedResponse({
    cacheKey,
    requestType = 'initial',
    responseData,
    provider,
    model,
    ttlSeconds = 3600
  }) {
    if (!cacheKey || !responseData) return;

    // Do NOT cache fallback or demo responses
    if (responseData.isDemoMode || responseData.provider === 'fallback' || responseData.source === 'fallback') {
      return;
    }

    // Do NOT cache responses with errors or missing gifts
    if (!Array.isArray(responseData.gifts) || responseData.gifts.length === 0) {
      return;
    }

    try {
      const db = await getDatabase();
      const id = uuidv4();
      const now = new Date();
      const createdAt = now.toISOString();
      
      const defaultTtl = parseInt(process.env.AI_CACHE_TTL_SECONDS, 10) || 3600;
      const effectiveTtl = typeof ttlSeconds === 'number' ? ttlSeconds : defaultTtl;
      const expiresAt = new Date(now.getTime() + effectiveTtl * 1000).toISOString();

      // Clean metadata fields from response before caching
      const cleanResponse = {
        recipient_summary: responseData.recipient_summary,
        gifts: responseData.gifts
      };

      const responseJson = JSON.stringify(cleanResponse);

      db.run(
        `INSERT OR REPLACE INTO ai_response_cache 
         (id, cache_key, request_type, response_json, provider, model, created_at, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          cacheKey,
          requestType,
          responseJson,
          normalizeString(provider),
          normalizeString(model),
          createdAt,
          expiresAt
        ]
      );

      saveDatabase();
    } catch (err) {
      console.warn('Failed to save to AI response cache:', err.message);
    }
  },

  /**
   * Deletes a cache key by name
   */
  async deleteCacheKey(cacheKey) {
    try {
      const db = await getDatabase();
      db.run(`DELETE FROM ai_response_cache WHERE cache_key = ?`, [cacheKey]);
      saveDatabase();
    } catch (err) {
      console.warn('Error deleting cache key:', err.message);
    }
  }
};
