/**
 * End-to-End API Test Suite for GiftBro AI Backend
 */
import { getDatabase } from '../src/config/database.js';
import { dbService } from '../src/services/dbService.js';
import { generateRecommendations, refineRecommendations } from '../src/services/aiService.js';

let failedTests = 0;
let passedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failedTests++;
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('🧪 Starting GiftBro AI Backend Automated Test Suite');
  console.log('====================================================\n');

  try {
    // 1. Database initialization test
    console.log('Test 1: SQLite Database Initialization');
    const db = await getDatabase();
    assert(db !== null, 'Database instance should be initialized');

    // 2. Recipient CRUD tests
    console.log('\nTest 2: Recipient Profile Management');
    const recipient = await dbService.createRecipient({
      name: 'Alex Miller',
      relationship: 'Brother',
      description: 'Loves hiking, sci-fi books, and board games.',
      age: '34',
      budget: '$60',
      occasion: 'Birthday'
    });
    assert(recipient && recipient.id, 'Recipient should be created with unique ID');
    assert(recipient.name === 'Alex Miller', 'Recipient name should match');

    const updated = await dbService.updateRecipient(recipient.id, { budget: '$50-$80' });
    assert(updated.budget === '$50-$80', 'Recipient budget should be updated');

    const allRecipients = await dbService.getAllRecipients();
    assert(allRecipients.some(r => r.id === recipient.id), 'Recipient should be in allRecipients list');

    // 3. AI Recommendations for Case 1
    console.log('\nTest 3: Case 1 - Brother (Hiking, Sci-Fi, Board Games, $60 Budget, Has Gear)');
    const recCase1 = await generateRecommendations({
      description: "My 34-year-old brother. Loves hiking, sci-fi books and board games. We're close. $60 budget. Already has most outdoor gear.",
      name: 'Alex',
      relationship: 'Brother',
      budget: '$60',
      age: '34'
    });
    assert(recCase1.gifts && recCase1.gifts.length >= 6, `Generated ${recCase1.gifts?.length} gifts (expected 6-8)`);
    assert(recCase1.recipient_summary && recCase1.recipient_summary.length > 10, 'Recipient summary should be present');
    assert(recCase1.gifts[0].match_score >= 80, 'Top gift match score should be >= 80');
    assert(recCase1.gifts[0].price_range && recCase1.gifts[0].category, 'Gift item must have price_range and category');

    // Verify gear constraint handling
    const gearItems = recCase1.gifts.filter(g => g.name.toLowerCase().includes('tent') || g.name.toLowerCase().includes('hiking boots'));
    assert(gearItems.length === 0, 'Should not recommend standard redundant hiking gear (tent, boots) since he already has gear');

    // 4. Conversational Refinement: "Make them cheaper"
    console.log('\nTest 4: Conversational Refinement ("Make them cheaper")');
    const refineCheaper = await refineRecommendations({
      recipientInfo: { description: 'Brother, hiking, sci-fi', name: 'Alex' },
      previousRecommendations: recCase1.gifts,
      conversationHistory: [{ role: 'user', content: 'Recommend gifts' }, { role: 'assistant', content: recCase1.recipient_summary }],
      userRefinement: 'Make them cheaper'
    });
    assert(refineCheaper.gifts && refineCheaper.gifts.length >= 6, 'Refinement should return 6-8 gifts');
    console.log('   Cheaper sample:', refineCheaper.gifts[0].name, refineCheaper.gifts[0].price_range);

    // 5. Conversational Refinement: "No clothing"
    console.log('\nTest 5: Conversational Refinement ("No clothing")');
    const refineNoClothing = await refineRecommendations({
      recipientInfo: { description: 'Brother, hiking, sci-fi', name: 'Alex' },
      previousRecommendations: recCase1.gifts,
      conversationHistory: [],
      userRefinement: 'No clothing'
    });
    const hasClothing = refineNoClothing.gifts.some(g =>
      g.category.toLowerCase().includes('apparel') ||
      g.name.toLowerCase().includes('sock') ||
      g.name.toLowerCase().includes('shirt')
    );
    assert(!hasClothing, 'Refined gifts should NOT include any clothing items');

    // 6. Gift History & Status Transitions
    console.log('\nTest 6: Gift History & Status Transitions (suggested -> saved -> bought -> archived)');
    const savedBatch = await dbService.saveGifts(recipient.id, recCase1.gifts.slice(0, 3));
    assert(savedBatch.length === 3, '3 gifts should be saved to recipient history');

    const boughtGift = await dbService.updateGiftStatus(savedBatch[0].id, 'bought');
    assert(boughtGift.status === 'bought', 'Gift status should be updated to "bought"');

    const archivedGift = await dbService.updateGiftStatus(savedBatch[1].id, 'archived');
    assert(archivedGift.status === 'archived', 'Gift status should be updated to "archived"');

    const savedGift = await dbService.updateGiftStatus(savedBatch[2].id, 'saved');
    assert(savedGift.status === 'saved', 'Gift status should be updated to "saved"');

    const history = await dbService.getGiftHistory(recipient.id);
    assert(history.bought.length >= 1, 'History bought list should contain the bought gift');
    assert(history.archived.length >= 1, 'History archived list should contain the archived gift');
    assert(history.saved.length >= 1, 'History saved list should contain the saved gift');

    // 7. Case 2 - Mom (Gardener, Cooking, Mystery Novels)
    console.log('\nTest 7: Case 2 - Mom (Gardener, Cooking, Mystery novels, busy, $50-80)');
    const recCase2 = await generateRecommendations({
      description: "My mom. Early 60s. Gardener, loves cooking and mystery novels. Busy with work. $50-80. Already has kitchen gadgets.",
      name: 'Mom',
      relationship: 'Mother',
      budget: '$50-$80',
      age: '62'
    });
    assert(recCase2.gifts.length >= 6, 'Case 2 should generate 6-8 gifts');
    assert(
      recCase2.gifts.some(g => g.category.includes('Garden') || g.category.includes('Mystery') || g.category.includes('Pantry')),
      'Mom recommendations should match gardening, mystery, or gourmet tastes'
    );

    // 8. Case 3 - Coworker (Startup Founder, Minimalism, $40, No clutter)
    console.log('\nTest 8: Case 3 - Coworker (Startup Founder, Minimalism, $40, No clutter)');
    const recCase3 = await generateRecommendations({
      description: "My coworker. Tech startup founder, early 30s, into minimalism. Budget $40. Doesn't like clutter or corporate gifts.",
      name: 'Sam',
      relationship: 'Coworker',
      budget: '$40'
    });
    assert(recCase3.gifts.length >= 6, 'Case 3 should generate 6-8 gifts');
    assert(
      recCase3.gifts.some(g => g.category.includes('Desk') || g.category.includes('Productivity') || g.category.includes('Consumable') || g.category.includes('Coffee')),
      'Case 3 should focus on clutter-free, consumable, or sleek minimalist options'
    );

    // 9. Case 4 - Best Friend\'s 5yo Daughter (Dinosaurs, Building blocks, STEM)
    console.log('\nTest 9: Case 4 - 5-year-old Daughter (Dinosaurs, Building blocks, Learning, $30)');
    const recCase4 = await generateRecommendations({
      description: "My best friend's 5-year-old daughter. Loves dinosaurs, building blocks and learning. $30. Already has lots of toys.",
      relationship: 'Friend\'s child',
      budget: '$30',
      age: '5'
    });
    assert(recCase4.gifts.length >= 6, 'Case 4 should generate 6-8 gifts');
    assert(
      recCase4.gifts.some(g => g.name.toLowerCase().includes('dinosaur') || g.category.includes('STEM')),
      'Case 4 should include dinosaur or STEM discovery options'
    );

    // 10. Clean up test recipient
    console.log('\nTest 10: Cleanup & Cascade Deletion');
    await dbService.deleteRecipient(recipient.id);
    const verifyDeleted = await dbService.getRecipientById(recipient.id);
    assert(verifyDeleted === null, 'Recipient and cascaded items should be deleted');

    console.log('\n====================================================');
    console.log(`🏁 Test Results: ${passedTests} PASSED, ${failedTests} FAILED`);
    console.log('====================================================');

    if (failedTests > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal test execution error:', err);
    process.exit(1);
  }
}

runTests();
