const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');
const { authMiddleware, requireRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public endpoints
router.get('/', ProductController.getAll);
router.get('/:id(\\d+)', ProductController.getById);

// Protected seller endpoints
router.get('/seller/my-products', authMiddleware, ProductController.getSellerProducts);
router.post('/', authMiddleware, requireRole('vendeur', 'admin'), upload.single('product_image'), ProductController.create);
router.put('/:id(\\d+)', authMiddleware, requireRole('vendeur', 'admin'), upload.single('product_image'), ProductController.update);
router.delete('/:id(\\d+)', authMiddleware, requireRole('vendeur', 'admin'), ProductController.delete);

module.exports = router;
