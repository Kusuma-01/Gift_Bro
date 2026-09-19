export const SYSTEM_PROMPT = `You are GiftBro AI, a thoughtful personalized gift recommendation assistant.

Your job is to understand the recipient as a person rather than simply matching keywords.

Analyze:
- interests
- hobbies
- personality
- age
- relationship
- occasion
- budget
- lifestyle
- existing possessions
- previous gifts
- user constraints

Generate specific, realistic and thoughtful gifts.

Never recommend generic categories when a specific gift can be suggested.

Always return valid JSON matching the requested schema.

Never recommend gifts that appear in:
- previous gifts
- bought gifts
- archived gifts
- rejected suggestions

During refinement, preserve all previous constraints unless the user explicitly changes them.

Respond ONLY with a valid JSON object in this exact schema without any markdown wrapping or commentary:
{
  "recipient_summary": "1-2 sentence empathetic breakdown of recipient traits, tastes, and constraints",
  "gifts": [
    {
      "rank": 1,
      "name": "Specific Gift Name (e.g. Aeropress Go Portable Travel Coffee Kit)",
      "price_range": "$35-$45",
      "category": "Outdoors & Travel",
      "reasoning": "Explicit explanation of why this specific gift fits their interests and doesn't overlap with items they already own",
      "match_score": 96
    }
  ]
}

Ensure exactly 6 to 8 gifts are generated, sorted by match_score descending with ranks 1 to 6-8.`;

export function buildInitialPrompt({ description, name, relationship, age, budget, occasion, excludedGifts = [] }) {
  const constraints = [];
  if (name) constraints.push(`Recipient Name: ${name}`);
  if (relationship) constraints.push(`Relationship: ${relationship}`);
  if (age) constraints.push(`Age: ${age}`);
  if (budget) constraints.push(`Target Budget: ${budget}`);
  if (occasion) constraints.push(`Occasion: ${occasion}`);

  let prompt = `RECIPIENT DESCRIPTION:
"${description}"
`;

  if (constraints.length > 0) {
    prompt += `\nSTRUCTURED DETAILS:\n${constraints.join('\n')}\n`;
  }

  if (excludedGifts && excludedGifts.length > 0) {
    prompt += `\nDO NOT RECOMMEND THE FOLLOWING (ALREADY BOUGHT, ARCHIVED, OR REJECTED):\n`;
    excludedGifts.forEach((item, i) => {
      prompt += `- ${item}\n`;
    });
  }

  prompt += `\nPlease analyze this person and generate 6 to 8 specific, ranked gift recommendations matching their profile. Return ONLY the JSON object.`;

  return prompt;
}

export function buildRefinementPrompt({
  recipientInfo = {},
  conversationHistory = [],
  previousRecommendations = [],
  userRefinement = '',
  excludedGifts = [],
  pastGifts = []
}) {
  let prompt = `ORIGINAL RECIPIENT PROFILE:
- Description: ${recipientInfo.description || 'N/A'}
- Name/Relationship: ${recipientInfo.name || 'Friend'} (${recipientInfo.relationship || 'Close'})
- Budget: ${recipientInfo.budget || 'As specified in description'}
- Age: ${recipientInfo.age || 'Unspecified'}
- Occasion: ${recipientInfo.occasion || 'General Gift'}
`;

  if (conversationHistory && conversationHistory.length > 0) {
    prompt += `\nPREVIOUS CONVERSATION CONTEXT:\n`;
    conversationHistory.forEach((msg) => {
      prompt += `${msg.role === 'user' ? 'User' : 'GiftBro AI'}: ${msg.content}\n`;
    });
  }

  if (previousRecommendations && previousRecommendations.length > 0) {
    prompt += `\nPREVIOUSLY SUGGESTED GIFTS:\n`;
    previousRecommendations.forEach((g, i) => {
      prompt += `${i + 1}. ${g.name} (${g.price_range}, Category: ${g.category})\n`;
    });
  }

  const allExcluded = [...new Set([...(excludedGifts || []), ...(pastGifts || [])])];
  if (allExcluded.length > 0) {
    prompt += `\nSTRICTLY FORBIDDEN / EXCLUDED GIFTS (Do NOT recommend these or near duplicates):\n`;
    allExcluded.forEach((item) => {
      prompt += `- ${typeof item === 'string' ? item : item.name}\n`;
    });
  }

  prompt += `\nNEW USER REFINEMENT REQUEST:
"${userRefinement}"

Instructions for this refinement:
1. Apply the user's new constraint (e.g. if cheaper, adjust price range lower; if no clothing, eliminate wearables; if unique/weird, pick distinct niche products; if experience, provide experiences).
2. Retain all prior positive profile context while obeying the new direction.
3. Generate 6 to 8 brand new or refined recommendations that completely avoid forbidden/excluded gifts.
4. Return ONLY valid JSON in the specified format.`;

  return prompt;
}
