const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware, requireRole } = require('../middleware/auth');

// All admin routes require valid authentication AND 'admin' role
router.use(authMiddleware, requireRole('admin'));

// Database Management Endpoints
router.get('/db/overview', adminController.getDatabaseOverview);
router.get('/db/table/:tableName', adminController.getTableRecords);
router.post('/users/:userId/toggle-block', adminController.toggleUserBlock);
router.get('/db/export', adminController.exportDatabaseJSON);

module.exports = router;
