import express from 'express';
import { recommendationController } from '../controllers/recommendationController.js';
import { recipientController } from '../controllers/recipientController.js';
import { giftController } from '../controllers/giftController.js';
import { trackingController } from '../controllers/trackingController.js';
import { authController } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

import { authValidation, recipientValidation, giftValidation } from '../middleware/validationMiddleware.js';

const router = express.Router();

// Health Check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'GiftBro AI Backend'
  });
});

// User Authentication Endpoints
router.post('/auth/register', authValidation.register, authController.register);
router.post('/auth/login', authValidation.login, authController.login);
router.get('/auth/me', authenticateToken(true), authController.getMe);
router.post('/auth/request-reset', authValidation.requestReset, authController.requestReset);
router.post('/auth/reset-password', authValidation.resetPassword, authController.resetPassword);

// AI Mode / Status
router.get('/ai-status', recommendationController.getAiStatus);

// Recommendation Endpoints (Optional Auth to attach user_id if logged in)
router.post('/recommend-gifts', authenticateToken(false), recommendationController.recommendGifts);
router.post('/refine-gifts', authenticateToken(false), recommendationController.refineGifts);

// Recipient Endpoints
router.post('/recipients', authenticateToken(true), recipientValidation.createOrUpdate, recipientController.createRecipient);
router.get('/recipients', authenticateToken(true), recipientController.getRecipients);
router.get('/recipients/:id', authenticateToken(true), recipientController.getRecipientById);
router.put('/recipients/:id', authenticateToken(true), recipientValidation.createOrUpdate, recipientController.updateRecipient);
router.delete('/recipients/:id', authenticateToken(true), recipientController.deleteRecipient);

// Gift Endpoints
router.post('/recipients/:id/gifts', authenticateToken(true), giftValidation.save, giftController.saveRecipientGift);
router.put('/gifts/:id/status', authenticateToken(true), giftValidation.updateStatus, giftController.updateStatus);
router.get('/recipients/:id/history', authenticateToken(true), giftController.getRecipientHistory);

// Shopping Tracking Endpoints
router.post('/tracking/shopping-click', trackingController.logShoppingClick);
router.get('/tracking/shopping-clicks', trackingController.getShoppingClicks);

export default router;
