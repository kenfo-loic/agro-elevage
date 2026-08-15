const express = require('express');
const router = express.Router();
const AIController = require('../controllers/aiController');
const { optionalAuthMiddleware, authMiddleware } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/chat', optionalAuthMiddleware, AIController.chat);
router.post('/diagnose', optionalAuthMiddleware, upload.single('ai_photo'), AIController.diagnose);
router.get('/history', authMiddleware, AIController.getHistory);

module.exports = router;
