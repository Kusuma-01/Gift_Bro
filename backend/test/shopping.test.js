/**
 * Shopping Integration Test Suite for GiftBro AI
 */
import { getDatabase } from '../src/config/database.js';
import { dbService } from '../src/services/dbService.js';

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

// Mirroring the provider logic for backend verification
const PLATFORMS = {
  amazon: 'https://www.amazon.com/s?k={query}',
  flipkart: 'https://www.flipkart.com/search?q={query}',
  google: 'https://www.google.com/search?tbm=shop&q={query}'
};

function buildShoppingUrl(platformKey, gift) {
  if (!gift) {
    throw new Error('Unable to create shopping search.');
  }

  const name = typeof gift === 'string' ? gift : gift?.name;
  if (!name || typeof name !== 'string' || !name.trim()) {
    throw new Error('Unable to create shopping search.');
  }

  const template = PLATFORMS[platformKey?.toLowerCase()?.trim()];
  if (!template) {
    throw new Error('This shopping platform is currently unavailable.');
  }

  const cleanQuery = name.trim().replace(/\s+/g, ' ');
  const encoded = encodeURIComponent(cleanQuery);
  return template.replace('{query}', encoded);
}

async function runShoppingTests() {
  console.log('========================================================');
  console.log('🛒 Running GiftBro AI Shopping Integration Test Suite');
  console.log('========================================================\n');

  // Test 1: 5 Required Benchmark Gifts
  console.log('Test 1: Benchmark Gift Search URL Generation');
  const benchmarkGifts = [
    "Vintage Enamel Camping Mug",
    "Personalized Leather Travel Journal",
    "Board Game: Terraforming Mars",
    "Portable Pour Over Coffee Maker",
    "Beginner Indoor Herb Garden Kit"
  ];

  for (const gift of benchmarkGifts) {
    const amazonUrl = buildShoppingUrl('amazon', gift);
    const flipkartUrl = buildShoppingUrl('flipkart', gift);
    const googleUrl = buildShoppingUrl('google', gift);

    assert(
      amazonUrl.startsWith('https://www.amazon.com/s?k=') && amazonUrl.includes(encodeURIComponent(gift)),
      `Amazon URL generated for: "${gift}"`
    );
    assert(
      flipkartUrl.startsWith('https://www.flipkart.com/search?q=') && flipkartUrl.includes(encodeURIComponent(gift)),
      `Flipkart URL generated for: "${gift}"`
    );
    assert(
      googleUrl.startsWith('https://www.google.com/search?tbm=shop&q=') && googleUrl.includes(encodeURIComponent(gift)),
      `Google Shopping URL generated for: "${gift}"`
    );
  }

  // Test 2: Special Characters & Edge Cases
  console.log('\nTest 2: Special Characters, Spaces, Long Names & Encoding');
  
  // Special characters: ampersand, colon, slash, apostrophe
  const specialGift = "Dungeons & Dragons: Starter Set (5th Edition) - Classic 'Red Box' / Kit";
  const specialUrl = buildShoppingUrl('amazon', specialGift);
  assert(!specialUrl.includes(' ') && specialUrl.includes('%26') && specialUrl.includes('%3A'), 'Special characters should be properly URL-encoded');

  // Long gift name
  const longGift = "Ultimate Ergonomic Adjustable Height Monitor Stand with USB-C Hub and Wireless Fast Charging Pad for Dual Displays";
  const longUrl = buildShoppingUrl('google', longGift);
  assert(longUrl.length > 80 && !longUrl.includes(' '), 'Long gift name generates clean encoded query without spaces');

  // Object input vs String input
  const objectGift = { name: "Vintage Enamel Camping Mug", price_range: "$20-$30", category: "Outdoor" };
  const objectUrl = buildShoppingUrl('amazon', objectGift);
  assert(objectUrl.includes('Vintage%20Enamel%20Camping%20Mug'), 'Handles gift objects containing name field');

  // Test 3: Error Handling
  console.log('\nTest 3: Error Handling for Invalid Inputs');
  
  try {
    buildShoppingUrl('amazon', null);
    assert(false, 'Should throw error when gift is null');
  } catch (err) {
    assert(err.message === 'Unable to create shopping search.', 'Throws "Unable to create shopping search." for null input');
  }

  try {
    buildShoppingUrl('amazon', { name: '   ' });
    assert(false, 'Should throw error when gift name is blank');
  } catch (err) {
    assert(err.message === 'Unable to create shopping search.', 'Throws "Unable to create shopping search." for blank gift name');
  }

  try {
    buildShoppingUrl('ebay_unsupported', "Vintage Enamel Camping Mug");
    assert(false, 'Should throw error for unsupported platform');
  } catch (err) {
    assert(err.message === 'This shopping platform is currently unavailable.', 'Throws "This shopping platform is currently unavailable."');
  }

  // Test 4: Database Persistence for Shopping Clicks
  console.log('\nTest 4: Shopping Click Tracking Persistence');
  await getDatabase();

  const clickRecord = await dbService.logShoppingClick({
    giftId: 'test-gift-123',
    giftName: 'Vintage Enamel Camping Mug',
    platform: 'amazon'
  });

  assert(clickRecord && clickRecord.id, 'Click event persisted with unique ID');
  assert(clickRecord.gift_name === 'Vintage Enamel Camping Mug', 'Click record contains gift name');
  assert(clickRecord.platform === 'amazon', 'Click record contains platform');

  const allClicks = await dbService.getShoppingClicks();
  assert(allClicks.some(c => c.id === clickRecord.id), 'Recorded click found in database query');

  console.log('\n========================================================');
  console.log(`🏁 Shopping Suite Results: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runShoppingTests();
