const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');
const { authMiddleware } = require('../middleware/auth');

router.post('/', authMiddleware, OrderController.create);
router.get('/buyer', authMiddleware, OrderController.getBuyerOrders);
router.get('/seller', authMiddleware, OrderController.getSellerOrders);
router.get('/:id(\\d+)', authMiddleware, OrderController.getById);
router.put('/:id(\\d+)/cancel', authMiddleware, OrderController.cancel);

module.exports = router;
