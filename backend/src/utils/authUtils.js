import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET;

if (process.env.NODE_ENV === 'production' && !JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is not set in production.');
}

/**
 * Hashes a plain password using PBKDF2 with SHA-512
 * PBKDF2 Parameters:
 * - 16-byte random salt: ensures unique hashes for identical passwords
 * - 100,000 iterations: slows down brute-force and dictionary attacks (NIST recommendation)
 * - 64-byte key length: matches SHA-512 output size
 * - sha512 digest: strong cryptographic hash function
 */
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verifies a plain password against stored salt:hash
 */
export function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, originalHash] = storedHash.split(':');
  const hashToVerify = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return crypto.timingSafeEqual(Buffer.from(originalHash, 'hex'), Buffer.from(hashToVerify, 'hex'));
}

/**
 * Base64URL encode helper
 */
function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * Base64URL decode helper
 */
function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

/**
 * Signs a JWT token with 7-day expiration
 */
export function signToken(payload) {
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const exp = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60); // 7 days
  const fullPayload = base64UrlEncode(JSON.stringify({ ...payload, exp }));
  
  const signatureInput = `${header}.${fullPayload}`;
  const signature = crypto
    .createHmac('sha256', JWT_SECRET || 'fallback_for_dev')
    .update(signatureInput)
    .digest('base64url');

  return `${header}.${fullPayload}.${signature}`;
}

/**
 * Verifies a JWT token and returns payload, or null if invalid/expired
 */
export function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [header, payload, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', JWT_SECRET || 'fallback_for_dev')
    .update(`${header}.${payload}`)
    .digest('base64url');

  try {
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const decodedPayload = JSON.parse(base64UrlDecode(payload));
    const now = Math.floor(Date.now() / 1000);
    if (decodedPayload.exp && decodedPayload.exp < now) {
      return null; // Expired token
    }

    return decodedPayload;
  } catch (err) {
    return null;
  }
}
