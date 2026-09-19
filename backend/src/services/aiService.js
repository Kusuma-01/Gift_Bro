import dotenv from 'dotenv';
import { SYSTEM_PROMPT, buildInitialPrompt, buildRefinementPrompt } from './promptTemplates.js';
import { extractAndParseJSON } from '../utils/jsonValidator.js';
import { generateMockRecommendations } from './mockAiService.js';

dotenv.config();

/**
 * Checks which AI provider is configured
 */
export function getAiConfig() {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (geminiKey && geminiKey.trim() !== '') {
    return { provider: 'gemini', apiKey: geminiKey.trim(), isLive: true };
  }
  if (openaiKey && openaiKey.trim() !== '') {
    return { provider: 'openai', apiKey: openaiKey.trim(), isLive: true };
  }

  return { provider: 'mock', apiKey: null, isLive: false };
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
 * Calls OpenAI REST API
 */
async function callOpenAI(apiKey, systemPrompt, userPrompt) {
  const url = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1/chat/completions';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
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
    throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const rawText = data?.choices?.[0]?.message?.content;
  return extractAndParseJSON(rawText);
}

/**
 * Main AI recommendation engine
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
      } else if (config.provider === 'openai') {
        result = await callOpenAI(config.apiKey, SYSTEM_PROMPT, userPrompt);
      }

      return {
        ...result,
        isDemoMode: false,
        provider: config.provider
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
        provider: 'fallback'
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
    provider: 'fallback'
  };
}

/**
 * Main AI refinement engine
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
      } else if (config.provider === 'openai') {
        result = await callOpenAI(config.apiKey, SYSTEM_PROMPT, userPrompt);
      }

      return {
        ...result,
        isDemoMode: false,
        provider: config.provider
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
        provider: 'fallback'
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
    provider: 'fallback'
  };
}
