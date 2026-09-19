import { getAiConfig } from './aiService.js';
import { getDatabase, saveDatabase } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Normalizes text for embedding
 */
function normalizeForEmbedding(text) {
  if (!text) return '';
  return String(text).toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Calculates cosine similarity between two vectors
 */
export function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0 || vecA.length !== vecB.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Fetches or generates an embedding for a string of text
 */
export async function getEmbedding(text) {
  const normalized = normalizeForEmbedding(text);
  if (!normalized) return null;

  // 1. Check Cache
  const db = await getDatabase();
  const stmt = db.prepare(`SELECT embedding_json FROM gift_embedding_cache WHERE normalized_text = ?`);
  let cachedJson = null;
  try {
    stmt.bind([normalized]);
    if (stmt.step()) {
      cachedJson = stmt.getAsObject().embedding_json;
    }
  } finally {
    stmt.free();
  }

  if (cachedJson) {
    try {
      return JSON.parse(cachedJson);
    } catch (err) {}
  }

  // 2. Call API
  const config = getAiConfig();
  if (!config.isLive) {
    // If not live, return a mock random vector so deduplication doesn't crash
    const mockVector = Array.from({ length: 100 }, () => Math.random() - 0.5);
    return mockVector;
  }

  try {
    let embedding = null;
    
    if (config.provider === 'gemini') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${config.apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "models/text-embedding-004",
          content: { parts: [{ text: normalized }] }
        })
      });
      if (response.ok) {
        const data = await response.json();
        embedding = data?.embedding?.values;
      }
    } else if (config.provider === 'openai' || config.provider === 'groq') {
      // Groq doesn't natively support embeddings well yet, so we fallback if needed. OpenAI supports text-embedding-3-small.
      const baseUrl = config.baseUrl.includes('groq') ? 'https://api.openai.com/v1/embeddings' : config.baseUrl.replace('/chat/completions', '/embeddings');
      // If Groq, this might fail unless they supplied a real OpenAI key. We catch errors gracefully.
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${config.apiKey}` },
        body: JSON.stringify({ input: normalized, model: 'text-embedding-3-small' })
      });
      if (response.ok) {
        const data = await response.json();
        embedding = data?.data?.[0]?.embedding;
      }
    }

    if (embedding) {
      // 3. Save to cache
      db.run(
        `INSERT OR IGNORE INTO gift_embedding_cache (id, normalized_text, embedding_json, created_at)
         VALUES (?, ?, ?, ?)`,
        [uuidv4(), normalized, JSON.stringify(embedding), new Date().toISOString()]
      );
      saveDatabase();
      return embedding;
    }
  } catch (err) {
    console.warn('Embedding generation failed:', err.message);
  }

  return null;
}

/**
 * Filters out generated gifts that are semantically too similar to past gifts.
 */
export async function filterSemanticDuplicates(candidateGifts, pastGifts, threshold = parseFloat(process.env.GIFT_SEMANTIC_SIMILARITY_THRESHOLD || '0.85')) {
  if (!pastGifts || pastGifts.length === 0) return candidateGifts;
  
  const pastEmbeddings = [];
  for (const item of pastGifts) {
    const text = typeof item === 'string' ? item : item.name;
    const emb = await getEmbedding(text);
    if (emb) pastEmbeddings.push({ text, embedding: emb });
  }

  if (pastEmbeddings.length === 0) return candidateGifts;

  const filtered = [];
  for (const candidate of candidateGifts) {
    const candidateEmb = await getEmbedding(candidate.name);
    if (!candidateEmb) {
      filtered.push(candidate);
      continue;
    }

    let isDuplicate = false;
    for (const past of pastEmbeddings) {
      const similarity = cosineSimilarity(candidateEmb, past.embedding);
      if (similarity > threshold) {
        console.log(`Semantic Dedup: Blocked "${candidate.name}" (Similarity: ${similarity.toFixed(2)} to "${past.text}")`);
        isDuplicate = true;
        break;
      }
    }

    if (!isDuplicate) {
      filtered.push(candidate);
    }
  }

  return filtered;
}
