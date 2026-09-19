import express from 'express';
import { recommendationController } from '../controllers/recommendationController.js';
import { recipientController } from '../controllers/recipientController.js';
import { giftController } from '../controllers/giftController.js';
import { trackingController } from '../controllers/trackingController.js';

const router = express.Router();

// Health Check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'GiftBro AI Backend'
  });
});

// AI Mode / Status
router.get('/ai-status', recommendationController.getAiStatus);

// Recommendation Endpoints
router.post('/recommend-gifts', recommendationController.recommendGifts);
router.post('/refine-gifts', recommendationController.refineGifts);

// Recipient Endpoints
router.post('/recipients', recipientController.createRecipient);
router.get('/recipients', recipientController.getRecipients);
router.get('/recipients/:id', recipientController.getRecipientById);
router.put('/recipients/:id', recipientController.updateRecipient);
router.delete('/recipients/:id', recipientController.deleteRecipient);

// Gift Endpoints
router.post('/recipients/:id/gifts', giftController.saveRecipientGift);
router.put('/gifts/:id/status', giftController.updateStatus);
router.get('/recipients/:id/history', giftController.getRecipientHistory);

// Shopping Tracking Endpoints
router.post('/tracking/shopping-click', trackingController.logShoppingClick);
router.get('/tracking/shopping-clicks', trackingController.getShoppingClicks);

export default router;
