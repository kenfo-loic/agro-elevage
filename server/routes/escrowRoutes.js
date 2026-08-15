const express = require('express');
const router = express.Router();
const EscrowController = require('../controllers/escrowController');
const { authMiddleware } = require('../middleware/auth');

router.post('/pay', authMiddleware, EscrowController.payEscrow);
router.post('/ship', authMiddleware, EscrowController.shipOrder);
router.post('/release', authMiddleware, EscrowController.releaseFunds);
router.post('/dispute', authMiddleware, EscrowController.dispute);
router.get('/wallet', authMiddleware, EscrowController.getWallet);
router.post('/withdraw', authMiddleware, EscrowController.withdraw);

module.exports = router;
