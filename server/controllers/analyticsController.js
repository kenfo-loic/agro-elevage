const db = require('../config/db');

class AnalyticsController {
  /**
   * Get Seller Dashboard Metrics
   */
  static getSellerAnalytics(req, res) {
    try {
      const sellerId = req.user.id;

      // Revenue summary
      const salesQuery = `
        SELECT 
          COALESCE(SUM(CASE WHEN status = 'FONDS_LIBERES' THEN subtotal ELSE 0 END), 0) as total_revenue,
          COALESCE(SUM(CASE WHEN status IN ('FONDS_BLOQUES_SEQUESTRE', 'EN_PREPARATION', 'EXPEDIE', 'LIVRE_NON_CONFIRME') THEN subtotal ELSE 0 END), 0) as pending_escrow_revenue,
          COUNT(id) as total_orders,
          SUM(CASE WHEN status IN ('FONDS_BLOQUES_SEQUESTRE', 'EN_PREPARATION', 'EXPEDIE') THEN 1 ELSE 0 END) as active_orders_count,
          SUM(CASE WHEN status = 'FONDS_LIBERES' THEN 1 ELSE 0 END) as completed_orders_count
        FROM orders
        WHERE seller_id = ?
      `;
      const salesStats = db.prepare(salesQuery).get(sellerId);

      // Stock summary
      const stockStats = db.prepare(`
        SELECT 
          COUNT(id) as total_products,
          SUM(CASE WHEN stock_quantity > 5 THEN 1 ELSE 0 END) as in_stock_count,
          SUM(CASE WHEN stock_quantity > 0 AND stock_quantity <= 5 THEN 1 ELSE 0 END) as low_stock_count,
          SUM(CASE WHEN stock_quantity <= 0 THEN 1 ELSE 0 END) as out_of_stock_count
        FROM products
        WHERE seller_id = ?
      `).get(sellerId);

      // Recent 5 orders
      const recentOrders = db.prepare(`
        SELECT o.*, p.name as product_name, b.name as buyer_name, b.phone as buyer_phone
        FROM orders o
        JOIN products p ON o.product_id = p.id
        JOIN users b ON o.buyer_id = b.id
        WHERE o.seller_id = ?
        ORDER BY o.created_at DESC
        LIMIT 5
      `).all(sellerId);

      // Chart.js 7-days sales data points simulation
      const chartLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
      const chartData = [15000, 22000, 18000, 30000, 25000, 40000, 35000];

      return res.json({
        success: true,
        summary: {
          totalRevenue: salesStats.total_revenue,
          pendingEscrowRevenue: salesStats.pending_escrow_revenue,
          walletBalance: req.user.wallet_balance,
          activeOrders: salesStats.active_orders_count || 0,
          completedOrders: salesStats.completed_orders_count || 0,
          totalProducts: stockStats.total_products || 0,
          inStockCount: stockStats.in_stock_count || 0,
          lowStockCount: stockStats.low_stock_count || 0,
          outOfStockCount: stockStats.out_of_stock_count || 0
        },
        chart: {
          labels: chartLabels,
          data: chartData
        },
        recentOrders
      });
    } catch (err) {
      console.error('[AnalyticsController.getSellerAnalytics]', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Get Buyer Dashboard Metrics
   */
  static getBuyerAnalytics(req, res) {
    try {
      const buyerId = req.user.id;

      const stats = db.prepare(`
        SELECT 
          COALESCE(SUM(total_amount), 0) as total_spent,
          COUNT(id) as total_orders,
          SUM(CASE WHEN status IN ('FONDS_BLOQUES_SEQUESTRE', 'EN_PREPARATION', 'EXPEDIE', 'LIVRE_NON_CONFIRME') THEN 1 ELSE 0 END) as active_deliveries,
          SUM(CASE WHEN status = 'FONDS_LIBERES' THEN 1 ELSE 0 END) as completed_orders
        FROM orders
        WHERE buyer_id = ?
      `).get(buyerId);

      const ongoingOrders = db.prepare(`
        SELECT o.*, p.name as product_name, p.image_url as product_image, s.name as seller_name, s.phone as seller_phone
        FROM orders o
        JOIN products p ON o.product_id = p.id
        JOIN users s ON o.seller_id = s.id
        WHERE o.buyer_id = ? AND o.status != 'FONDS_LIBERES' AND o.status != 'ANNULE'
        ORDER BY o.created_at DESC
      `).all(buyerId);

      return res.json({
        success: true,
        summary: {
          totalSpent: stats.total_spent,
          totalOrders: stats.total_orders,
          activeDeliveries: stats.active_deliveries || 0,
          completedOrders: stats.completed_orders || 0
        },
        ongoingOrders
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}

module.exports = AnalyticsController;
