import { dbService } from '../services/dbService.js';
import { hashPassword, verifyPassword, signToken } from '../utils/authUtils.js';

export const authController = {
  /**
   * POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      const { name, email, password } = req.body;

      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: 'Name is required.' });
      }
      if (!email || typeof email !== 'string' || !email.includes('@')) {
        return res.status(400).json({ error: 'Valid email address is required.' });
      }
      if (!password || typeof password !== 'string' || password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      }

      const existingUser = await dbService.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: 'An account with this email address already exists.' });
      }

      const passwordHash = hashPassword(password);
      const user = await dbService.createUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        passwordHash
      });

      const token = signToken({ id: user.id, email: user.email });

      return res.status(201).json({
        message: 'Account created successfully.',
        user: { id: user.id, name: user.name, email: user.email, created_at: user.created_at },
        token
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      const user = await dbService.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const isMatch = verifyPassword(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const token = signToken({ id: user.id, email: user.email });

      return res.json({
        message: 'Login successful.',
        user: { id: user.id, name: user.name, email: user.email, created_at: user.created_at },
        token
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/auth/me
   */
  async getMe(req, res, next) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated.' });
      }
      return res.json({ user: req.user });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/auth/request-reset
   */
  async requestReset(req, res, next) {
    try {
      const { email } = req.body;
      const user = await dbService.getUserByEmail(email);
      if (!user) {
        // Return 200 even if not found to prevent email enumeration
        return res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
      }
      
      const crypto = await import('crypto');
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hash = crypto.createHash('sha256').update(resetToken).digest('hex');
      
      const now = new Date();
      const expires = new Date(now.getTime() + 60 * 60 * 1000).toISOString(); // 1 hour
      
      await dbService.setUserResetToken(user.id, hash, expires);
      
      // In a real app, send an email here. For this project, we just mock it.
      console.log(`[MOCK EMAIL] Password reset token for ${email}: ${resetToken}`);
      
      return res.json({ message: 'If an account with that email exists, a reset link has been sent.', devToken: resetToken });
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/auth/reset-password
   */
  async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;
      const crypto = await import('crypto');
      const hash = crypto.createHash('sha256').update(token).digest('hex');
      
      const user = await dbService.getUserByResetToken(hash);
      if (!user) {
        return res.status(400).json({ error: 'Invalid or expired password reset token.' });
      }
      
      const now = new Date().toISOString();
      if (user.reset_token_expires < now) {
        return res.status(400).json({ error: 'Invalid or expired password reset token.' });
      }
      
      const passwordHash = hashPassword(newPassword);
      await dbService.updateUserPassword(user.id, passwordHash);
      
      return res.json({ message: 'Password has been reset successfully.' });
    } catch (err) {
      next(err);
    }
  }
};
