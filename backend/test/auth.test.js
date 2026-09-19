import test from 'node:test';
import assert from 'node:assert';
import { getDatabase } from '../src/config/database.js';
import { dbService } from '../src/services/dbService.js';
import { hashPassword, verifyPassword, signToken, verifyToken } from '../src/utils/authUtils.js';
import { authenticateToken } from '../src/middleware/authMiddleware.js';

test('Auth System', async (t) => {
  const db = await getDatabase();
  
  await t.test('Password Hashing and Verification', () => {
    const pwd = 'my_secure_password';
    const hashed = hashPassword(pwd);
    
    assert.strictEqual(typeof hashed, 'string');
    assert.ok(hashed.includes(':')); // Should have salt:hash format
    
    assert.ok(verifyPassword(pwd, hashed), 'Correct password should verify');
    assert.ok(!verifyPassword('wrong', hashed), 'Wrong password should fail');
    assert.ok(!verifyPassword(pwd, 'invalid'), 'Invalid hash format should fail');
  });
  
  await t.test('JWT Signing and Verification', () => {
    const payload = { id: 'user123', email: 'test@example.com' };
    const token = signToken(payload);
    
    assert.strictEqual(typeof token, 'string');
    assert.strictEqual(token.split('.').length, 3, 'JWT should have 3 parts');
    
    const verified = verifyToken(token);
    assert.ok(verified, 'Valid token should decode');
    assert.strictEqual(verified.id, 'user123');
    assert.strictEqual(verified.email, 'test@example.com');
    assert.ok(verified.exp > Math.floor(Date.now() / 1000), 'Expiration should be in future');
    
    // Tampered token
    const tampered = token.slice(0, -5) + 'abcde';
    assert.strictEqual(verifyToken(tampered), null, 'Tampered token should return null');
  });

  await t.test('Auth Middleware', async () => {
    const user = await dbService.createUser({
      name: 'Test Auth User',
      email: 'authtest@example.com',
      passwordHash: hashPassword('password123')
    });
    
    const token = signToken({ id: user.id });
    
    // Mock req, res, next
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = { status: (c) => ({ json: (d) => ({ code: c, data: d }) }) };
    
    let nextCalled = false;
    const next = () => { nextCalled = true; };
    
    const middleware = authenticateToken(true);
    await middleware(req, res, next);
    
    assert.ok(nextCalled, 'Next should be called for valid token');
    assert.ok(req.user, 'User should be attached to request');
    assert.strictEqual(req.user.id, user.id);
  });
});
