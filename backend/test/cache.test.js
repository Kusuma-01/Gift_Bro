/**
 * Comprehensive Cache Test Suite for GiftBro AI Backend
 * Mocks AI provider to prevent real API credit consumption
 */
import { getDatabase } from '../src/config/database.js';
import { cacheService } from '../src/services/cacheService.js';
import { generateRecommendations, refineRecommendations } from '../src/services/aiService.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

async function runCacheTests() {
  console.log('====================================================');
  console.log('⚡ Running GiftBro AI Cache Automated Test Suite');
  console.log('====================================================\n');

  try {
    const db = await getDatabase();
    assert(db !== null, 'Database initialized for cache testing');

    // Clean cache table before running tests
    db.run(`DELETE FROM ai_response_cache`);

    // Helper to clear cache table
    const clearCache = () => db.run(`DELETE FROM ai_response_cache`);

    // ----------------------------------------------------
    // Test 1: First request (Cache Miss)
    // ----------------------------------------------------
    console.log('Test 1: First request -> Cache Miss & AI called');
    const params1 = {
      description: 'My 28-year-old brother who loves hiking and board games.',
      name: 'Alex',
      relationship: 'Brother',
      budget: '$50-$80',
      occasion: 'Birthday'
    };

    const key1 = cacheService.generateCacheKey({ ...params1, provider: 'mock_test', model: 'test_model_a' });
    const cached1 = await cacheService.getCachedResponse(key1, 'mock_test', 'test_model_a');
    assert(cached1 === null, 'First request should be a cache miss');

    // Store a simulated successful AI response in cache
    const mockAiResponse1 = {
      recipient_summary: 'Test summary for Alex',
      gifts: [
        { rank: 1, name: 'Camping Stove', price_range: '$50', category: 'Outdoor', reasoning: 'Great for hiking', match_score: 95 }
      ]
    };
    await cacheService.setCachedResponse({
      cacheKey: key1,
      requestType: 'initial',
      responseData: mockAiResponse1,
      provider: 'mock_test',
      model: 'test_model_a',
      ttlSeconds: 3600
    });

    // ----------------------------------------------------
    // Test 2: Identical second request (Cache Hit)
    // ----------------------------------------------------
    console.log('\nTest 2: Identical second request -> Cache Hit');
    const cached2 = await cacheService.getCachedResponse(key1, 'mock_test', 'test_model_a');
    assert(cached2 !== null && cached2.source === 'cache', 'Identical second request returns source: "cache"');
    assert(cached2.gifts[0].name === 'Camping Stove', 'Cached response contains correct gift data');

    // ----------------------------------------------------
    // Test 3: Changed budget -> Different cache key
    // ----------------------------------------------------
    console.log('\nTest 3: Changed budget -> Different cache key');
    const params3 = { ...params1, budget: '$20-$30' };
    const key3 = cacheService.generateCacheKey({ ...params3, provider: 'mock_test', model: 'test_model_a' });
    assert(key1 !== key3, 'Changing budget produces a different cache key');
    const cached3 = await cacheService.getCachedResponse(key3, 'mock_test', 'test_model_a');
    assert(cached3 === null, 'Changed budget is a cache miss');

    // ----------------------------------------------------
    // Test 4: Changed interests -> Different cache key
    // ----------------------------------------------------
    console.log('\nTest 4: Changed interests -> Different cache key');
    const params4 = { ...params1, description: 'My 28-year-old brother who loves cooking and coffee.' };
    const key4 = cacheService.generateCacheKey({ ...params4, provider: 'mock_test', model: 'test_model_a' });
    assert(key1 !== key4, 'Changing interests produces a different cache key');
    const cached4 = await cacheService.getCachedResponse(key4, 'mock_test', 'test_model_a');
    assert(cached4 === null, 'Changed interests is a cache miss');

    // ----------------------------------------------------
    // Test 5: Changed exclusions -> Different cache key
    // ----------------------------------------------------
    console.log('\nTest 5: Changed exclusions -> Different cache key');
    const key5 = cacheService.generateCacheKey({ ...params1, excludedGifts: ['Camping Stove'], provider: 'mock_test', model: 'test_model_a' });
    assert(key1 !== key5, 'Adding excluded gifts produces a different cache key');

    // ----------------------------------------------------
    // Test 6: Changed refinement -> Different cache key
    // ----------------------------------------------------
    console.log('\nTest 6: Changed refinement -> Different cache key');
    const keyRefine1 = cacheService.generateCacheKey({
      requestType: 'refinement',
      userRefinement: 'Make them cheaper',
      provider: 'mock_test',
      model: 'test_model_a'
    });
    const keyRefine2 = cacheService.generateCacheKey({
      requestType: 'refinement',
      userRefinement: 'No clothing',
      provider: 'mock_test',
      model: 'test_model_a'
    });
    assert(keyRefine1 !== keyRefine2, 'Different user refinements produce different cache keys');

    // ----------------------------------------------------
    // Test 7: Expired cache -> AI called again
    // ----------------------------------------------------
    console.log('\nTest 7: Expired cache -> Cache Miss');
    const keyExpired = cacheService.generateCacheKey({ description: 'Expired test', provider: 'mock_test', model: 'test_model_a' });
    await cacheService.setCachedResponse({
      cacheKey: keyExpired,
      requestType: 'initial',
      responseData: mockAiResponse1,
      provider: 'mock_test',
      model: 'test_model_a',
      ttlSeconds: -10 // already expired!
    });
    const cachedExpired = await cacheService.getCachedResponse(keyExpired, 'mock_test', 'test_model_a');
    assert(cachedExpired === null, 'Expired cache entry returns null (cache miss)');

    // ----------------------------------------------------
    // Test 8: AI failure / No key -> Fallback engine works
    // ----------------------------------------------------
    console.log('\nTest 8: AI Failure / No Key -> Fallback Engine Works');
    const origGeminiKey = process.env.GEMINI_API_KEY;
    const origOpenAIKey = process.env.OPENAI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    const fallbackRes = await generateRecommendations({
      description: 'Test fallback recipient'
    });
    assert(fallbackRes.isDemoMode === true, 'Fallback response sets isDemoMode: true');
    assert(fallbackRes.source === 'fallback', 'Fallback response returns source: "fallback"');
    assert(fallbackRes.gifts && fallbackRes.gifts.length >= 6, 'Fallback generates 6-8 gifts');

    // ----------------------------------------------------
    // Test 9: Failed / Fallback response is NOT cached
    // ----------------------------------------------------
    console.log('\nTest 9: Failed / Fallback response is NOT cached');
    const keyFallback = cacheService.generateCacheKey({ description: 'Fallback not cached test', provider: 'fallback', model: 'mock-engine' });
    await cacheService.setCachedResponse({
      cacheKey: keyFallback,
      requestType: 'initial',
      responseData: fallbackRes, // isDemoMode: true, provider: 'fallback'
      provider: 'fallback',
      model: 'mock-engine'
    });
    const cachedFallback = await cacheService.getCachedResponse(keyFallback, 'fallback', 'mock-engine');
    assert(cachedFallback === null, 'Fallback responses are NOT stored in AI response cache');

    // Restore keys
    if (origGeminiKey) process.env.GEMINI_API_KEY = origGeminiKey;
    if (origOpenAIKey) process.env.OPENAI_API_KEY = origOpenAIKey;

    // ----------------------------------------------------
    // Test 10: Provider difference -> Gemini cache NOT reused for OpenAI
    // ----------------------------------------------------
    console.log('\nTest 10: Provider Difference -> Gemini cache not reused for OpenAI');
    const keyGemini = cacheService.generateCacheKey({ description: 'Provider test', provider: 'gemini', model: 'gemini-2.5-flash' });
    const keyOpenAI = cacheService.generateCacheKey({ description: 'Provider test', provider: 'openai', model: 'gpt-4o-mini' });
    assert(keyGemini !== keyOpenAI, 'Gemini and OpenAI generate different cache keys');

    await cacheService.setCachedResponse({
      cacheKey: keyGemini,
      requestType: 'initial',
      responseData: mockAiResponse1,
      provider: 'gemini',
      model: 'gemini-2.5-flash'
    });
    const cachedCrossProvider = await cacheService.getCachedResponse(keyGemini, 'openai', 'gpt-4o-mini');
    assert(cachedCrossProvider === null, 'Gemini cache entry cannot be fetched under OpenAI provider');

    // ----------------------------------------------------
    // Test 11: Model difference -> Different models do NOT reuse cache
    // ----------------------------------------------------
    console.log('\nTest 11: Model Difference -> Different models do not reuse cache');
    const keyModel1 = cacheService.generateCacheKey({ description: 'Model test', provider: 'openai', model: 'gpt-4o-mini' });
    const keyModel2 = cacheService.generateCacheKey({ description: 'Model test', provider: 'openai', model: 'gpt-4o' });
    assert(keyModel1 !== keyModel2, 'Different models produce different cache keys');

    // ----------------------------------------------------
    // Test 12: Malformed cache data -> Handles safely without crashing
    // ----------------------------------------------------
    console.log('\nTest 12: Malformed cache data handling');
    const keyMalformed = 'malformed-test-key';
    db.run(
      `INSERT OR REPLACE INTO ai_response_cache (id, cache_key, request_type, response_json, provider, model, created_at, expires_at)
       VALUES ('123', ?, 'initial', 'INVALID_JSON{{{', 'mock_test', 'test_model_a', '2026-01-01', '2099-01-01')`,
      [keyMalformed]
    );
    const cachedMalformed = await cacheService.getCachedResponse(keyMalformed, 'mock_test', 'test_model_a');
    assert(cachedMalformed === null, 'Malformed cache JSON returns null gracefully without crashing');

    console.log('\n====================================================');
    console.log(`🏁 Cache Suite Results: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal error in cache test suite:', err);
    process.exit(1);
  }
}

runCacheTests();
