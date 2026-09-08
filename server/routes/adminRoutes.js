const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware, requireRole } = require('../middleware/auth');

// All admin routes require valid authentication AND 'admin' role
router.use(authMiddleware, requireRole('admin'));

// Users Management Endpoints
router.get('/users', adminController.getAllUsers);
router.delete('/users/:userId', adminController.deleteUser);
router.post('/users/:userId/toggle-block', adminController.toggleUserBlock);

// Products Management Endpoints
router.get('/products', adminController.getAllProducts);
router.put('/products/:productId', adminController.updateProduct);
router.delete('/products/:productId', adminController.deleteProduct);

// Database Management Endpoints
router.get('/db/overview', adminController.getDatabaseOverview);
router.get('/db/table/:tableName', adminController.getTableRecords);
router.get('/db/export', adminController.exportDatabaseJSON);

module.exports = router;
