/**
 * Extracts and cleans JSON from LLM text responses
 */
export function extractAndParseJSON(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Raw response is empty or not a string');
  }

  // Remove markdown code fences ```json ... ``` or ``` ... ```
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  }

  // Find first { and last }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error('No valid JSON object found in LLM response');
  }

  const jsonSubstring = cleaned.substring(firstBrace, lastBrace + 1);

  // Parse JSON
  let parsed;
  try {
    parsed = JSON.parse(jsonSubstring);
  } catch (err) {
    // Attempt basic fix for trailing commas before } or ]
    const fixed = jsonSubstring
      .replace(/,\s*([\]}])/g, '$1')
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, ''); // strip unescaped control chars
    parsed = JSON.parse(fixed);
  }

  // Validate and normalize schema
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Parsed result is not an object');
  }

  const summary = parsed.recipient_summary || 'Personalized gift recommendations tailored to recipient interests.';
  const rawGifts = Array.isArray(parsed.gifts) ? parsed.gifts : [];

  const normalizedGifts = rawGifts.map((g, idx) => {
    let score = Number(g.match_score);
    if (isNaN(score) || score < 50 || score > 100) {
      score = Math.max(75, 98 - idx * 3);
    }

    return {
      rank: Number(g.rank) || (idx + 1),
      name: String(g.name || 'Thoughtful Personalized Gift').trim(),
      price_range: String(g.price_range || '$30-$50').trim(),
      category: String(g.category || 'General').trim(),
      reasoning: String(g.reasoning || 'Chosen to fit their unique personality and interests.').trim(),
      match_score: Math.round(score),
    };
  });

  return {
    recipient_summary: summary,
    gifts: normalizedGifts
  };
}
