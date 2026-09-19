import { verifyToken } from '../utils/authUtils.js';
import { dbService } from '../services/dbService.js';

/**
 * Middleware that authenticates JWT token if present
 * Supports both strict auth (required = true) and optional auth (required = false)
 */
export function authenticateToken(required = true) {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

      if (!token) {
        if (required) {
          return res.status(401).json({ error: 'Access denied. Authentication token is required.' });
        }
        req.user = null;
        return next();
      }

      const decoded = verifyToken(token);
      if (!decoded || !decoded.id) {
        if (required) {
          return res.status(401).json({ error: 'Invalid or expired authentication token.' });
        }
        req.user = null;
        return next();
      }

      const user = await dbService.getUserById(decoded.id);
      if (!user) {
        if (required) {
          return res.status(401).json({ error: 'User account no longer exists.' });
        }
        req.user = null;
        return next();
      }

      req.user = { id: user.id, name: user.name, email: user.email };
      next();
    } catch (err) {
      if (required) {
        return res.status(500).json({ error: 'Authentication middleware error.', details: err.message });
      }
      req.user = null;
      next();
    }
  };
}
