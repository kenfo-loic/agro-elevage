const express = require('express');
const router = express.Router();
const AnalyticsController = require('../controllers/analyticsController');
const { authMiddleware, requireRole } = require('../middleware/auth');

router.get('/seller', authMiddleware, requireRole('vendeur', 'admin'), AnalyticsController.getSellerAnalytics);
router.get('/buyer', authMiddleware, requireRole('acheteur', 'admin'), AnalyticsController.getBuyerAnalytics);

module.exports = router;
