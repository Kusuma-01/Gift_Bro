import test from 'node:test';
import assert from 'node:assert';
import { getDatabase } from '../src/config/database.js';
import { dbService } from '../src/services/dbService.js';

test('Database Service & Transactions', async (t) => {
  const db = await getDatabase();
  
  await t.test('Pagination Logic', async () => {
    const user = await dbService.createUser({
      name: 'Page Test', email: 'page@example.com', passwordHash: 'hash'
    });
    
    // Create 15 recipients
    for (let i = 0; i < 15; i++) {
      await dbService.createRecipient({ name: `Recip ${i}`, userId: user.id });
    }
    
    const page1 = await dbService.getPaginatedRecipients({ page: 1, limit: 10, userId: user.id });
    assert.strictEqual(page1.recipients.length, 10);
    assert.strictEqual(page1.pagination.total, 15);
    assert.strictEqual(page1.pagination.totalPages, 2);
    
    const page2 = await dbService.getPaginatedRecipients({ page: 2, limit: 10, userId: user.id });
    assert.strictEqual(page2.recipients.length, 5);
  });
  
  await t.test('Transaction Rollback (Simulated)', async () => {
    const recip = await dbService.createRecipient({ name: 'Rollback Test' });
    
    const gifts = [
      { name: 'Gift 1' },
      { name: 'Gift 2' },
      { name: null } // This will cause SQLite constraint error because name is NOT NULL
    ];
    
    try {
      await dbService.saveGifts(recip.id, gifts);
      assert.fail('Should have thrown an error');
    } catch (err) {
      assert.ok(err.message.includes('NOT NULL'), 'Expected NOT NULL constraint error');
    }
    
    // Check if partial writes persisted
    const history = await dbService.getGiftHistory(recip.id);
    assert.strictEqual(history.all.length, 0, 'No gifts should be saved due to rollback');
  });
});
