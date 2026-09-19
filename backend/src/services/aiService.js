import dotenv from 'dotenv';
import { SYSTEM_PROMPT, buildInitialPrompt, buildRefinementPrompt } from './promptTemplates.js';
import { extractAndParseJSON } from '../utils/jsonValidator.js';
import { generateMockRecommendations } from './mockAiService.js';
import { cacheService } from './cacheService.js';

dotenv.config();

/**
 * Checks which AI provider is configured and returns provider + model metadata
 */
export function getAiConfig() {
  const geminiKey = (process.env.GEMINI_API_KEY || process.env.AI_API_KEY || '').trim();
  const openaiKey = (process.env.OPENAI_API_KEY || '').trim();

  // If Groq key is present (gsk_...), use Groq API with LLaMA 3.3 70B
  if (openaiKey.startsWith('gsk_')) {
    return {
      provider: 'groq',
      apiKey: openaiKey,
      baseUrl: process.env.OPENAI_BASE_URL || 'https://api.groq.com/openai/v1/chat/completions',
      model: process.env.OPENAI_MODEL && !process.env.OPENAI_MODEL.includes('gpt') ? process.env.OPENAI_MODEL : 'llama-3.3-70b-versatile',
      isLive: true
    };
  }

  // If real Gemini key is present (not dummy placeholder starting with AQ.)
  if (geminiKey !== '' && !geminiKey.startsWith('AQ.')) {
    return {
      provider: 'gemini',
      apiKey: geminiKey,
      isLive: true,
      model: 'gemini-2.5-flash'
    };
  }

  // Standard OpenAI key
  if (openaiKey !== '') {
    return {
      provider: 'openai',
      apiKey: openaiKey,
      baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1/chat/completions',
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      isLive: true
    };
  }

  return {
    provider: 'mock',
    apiKey: null,
    isLive: false,
    model: 'mock-engine'
  };
}

/**
 * Calls Gemini REST API
 */
async function callGemini(apiKey, systemPrompt, userPrompt) {
  const models = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash'];
  let lastError = null;

  for (const model of models) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const payload = {
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: "application/json"
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error('Gemini returned empty candidate content');
      }

      return extractAndParseJSON(rawText);
    } catch (err) {
      lastError = err;
      console.warn(`Attempt with ${model} failed: ${err.message}. Retrying next model...`);
    }
  }

  throw lastError;
}

/**
 * Calls OpenAI / Groq REST API
 */
async function callOpenAI(apiKey, systemPrompt, userPrompt, customUrl, customModel) {
  let url = customUrl || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1/chat/completions';
  if (url.includes('groq.com') && !url.endsWith('/chat/completions')) {
    url = url.replace(/\/+$/, '') + '/chat/completions';
  }

  const isGroq = url.includes('groq.com');
  const models = isGroq
    ? Array.from(new Set([customModel, 'llama-3.3-70b-versatile', 'llama3-70b-8192', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'].filter(Boolean)))
    : [customModel || process.env.OPENAI_MODEL || 'gpt-4o-mini'];

  let lastError = null;

  for (const m of models) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: m,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          response_format: { type: "json_object" },
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI API error (${response.status}) on model ${m}: ${errorText}`);
      }

      const data = await response.json();
      const rawText = data?.choices?.[0]?.message?.content;
      return extractAndParseJSON(rawText);
    } catch (err) {
      lastError = err;
      if (!isGroq) throw err;
      console.warn(`Groq model attempt (${m}) failed: ${err.message}. Retrying next model...`);
    }
  }

  throw lastError;
}

/**
 * Main AI recommendation engine with deterministic caching
 */
export async function generateRecommendations({
  description,
  name,
  relationship,
  age,
  budget,
  occasion,
  excludedGifts = [],
  pastGifts = []
}) {
  const config = getAiConfig();

  if (config.isLive) {
    const cacheKey = cacheService.generateCacheKey({
      requestType: 'initial',
      description,
      name,
      relationship,
      age,
      budget,
      occasion,
      excludedGifts,
      pastGifts,
      provider: config.provider,
      model: config.model
    });

    // Check cache
    const cached = await cacheService.getCachedResponse(cacheKey, config.provider, config.model);
    if (cached) {
      return {
        ...cached,
        isDemoMode: false,
        provider: config.provider,
        source: 'cache'
      };
    }

    try {
      const userPrompt = buildInitialPrompt({
        description,
        name,
        relationship,
        age,
        budget,
        occasion,
        excludedGifts: [...excludedGifts, ...pastGifts]
      });

      let result;
      if (config.provider === 'gemini') {
        result = await callGemini(config.apiKey, SYSTEM_PROMPT, userPrompt);
      } else if (config.provider === 'openai' || config.provider === 'groq') {
        result = await callOpenAI(config.apiKey, SYSTEM_PROMPT, userPrompt, config.baseUrl, config.model);
      }

      // Save to cache on success
      await cacheService.setCachedResponse({
        cacheKey,
        requestType: 'initial',
        responseData: result,
        provider: config.provider,
        model: config.model
      });

      return {
        ...result,
        isDemoMode: false,
        provider: config.provider,
        source: 'ai'
      };
    } catch (err) {
      console.warn('Live AI generation failed. Falling back to local Heuristic Mock Engine:', err.message);
      const fallback = generateMockRecommendations({
        description,
        name,
        relationship,
        age,
        budget,
        occasion,
        excludedGifts,
        pastGifts
      });

      return {
        ...fallback,
        isDemoMode: true,
        demoReason: `Live AI error (${err.message}) - switched to fallback mode`,
        provider: 'fallback',
        source: 'fallback'
      };
    }
  }

  // Fallback / Demo mode when no key configured
  const mockResult = generateMockRecommendations({
    description,
    name,
    relationship,
    age,
    budget,
    occasion,
    excludedGifts,
    pastGifts
  });

  return {
    ...mockResult,
    isDemoMode: true,
    demoReason: 'Demo Mode (no API key configured)',
    provider: 'fallback',
    source: 'fallback'
  };
}

/**
 * Main AI refinement engine with deterministic caching
 */
export async function refineRecommendations({
  recipientInfo = {},
  conversationHistory = [],
  previousRecommendations = [],
  userRefinement = '',
  excludedGifts = [],
  pastGifts = []
}) {
  const config = getAiConfig();

  if (config.isLive) {
    const cacheKey = cacheService.generateCacheKey({
      requestType: 'refinement',
      recipientInfo,
      conversationHistory,
      previousRecommendations,
      userRefinement,
      excludedGifts,
      pastGifts,
      provider: config.provider,
      model: config.model
    });

    // Check cache
    const cached = await cacheService.getCachedResponse(cacheKey, config.provider, config.model);
    if (cached) {
      return {
        ...cached,
        isDemoMode: false,
        provider: config.provider,
        source: 'cache'
      };
    }

    try {
      const userPrompt = buildRefinementPrompt({
        recipientInfo,
        conversationHistory,
        previousRecommendations,
        userRefinement,
        excludedGifts,
        pastGifts
      });

      let result;
      if (config.provider === 'gemini') {
        result = await callGemini(config.apiKey, SYSTEM_PROMPT, userPrompt);
      } else if (config.provider === 'openai' || config.provider === 'groq') {
        result = await callOpenAI(config.apiKey, SYSTEM_PROMPT, userPrompt, config.baseUrl, config.model);
      }

      // Save to cache on success
      await cacheService.setCachedResponse({
        cacheKey,
        requestType: 'refinement',
        responseData: result,
        provider: config.provider,
        model: config.model
      });

      return {
        ...result,
        isDemoMode: false,
        provider: config.provider,
        source: 'ai'
      };
    } catch (err) {
      console.warn('Live AI refinement failed. Falling back to local Heuristic Mock Engine:', err.message);
      const fallback = generateMockRecommendations({
        description: recipientInfo.description,
        name: recipientInfo.name,
        relationship: recipientInfo.relationship,
        age: recipientInfo.age,
        budget: recipientInfo.budget,
        occasion: recipientInfo.occasion,
        userRefinement,
        excludedGifts,
        pastGifts
      });

      return {
        ...fallback,
        isDemoMode: true,
        demoReason: `Live AI error (${err.message}) - switched to fallback mode`,
        provider: 'fallback',
        source: 'fallback'
      };
    }
  }

  // Fallback / Demo mode
  const mockResult = generateMockRecommendations({
    description: recipientInfo.description,
    name: recipientInfo.name,
    relationship: recipientInfo.relationship,
    age: recipientInfo.age,
    budget: recipientInfo.budget,
    occasion: recipientInfo.occasion,
    userRefinement,
    excludedGifts,
    pastGifts
  });

  return {
    ...mockResult,
    isDemoMode: true,
    demoReason: 'Demo Mode (no API key configured)',
    provider: 'fallback',
    source: 'fallback'
  };
}
