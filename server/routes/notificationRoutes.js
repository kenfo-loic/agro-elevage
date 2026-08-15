const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notificationController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, NotificationController.getAll);
router.put('/read-all', authMiddleware, NotificationController.markAllAsRead);
router.put('/:id(\\d+)/read', authMiddleware, NotificationController.markAsRead);

module.exports = router;
