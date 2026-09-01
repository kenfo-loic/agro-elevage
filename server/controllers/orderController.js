const db = require('../config/db');
const NotificationService = require('../services/notificationService');
const config = require('../config/config');

class OrderController {
  /**
   * Create new order
   */
  static create(req, res) {
    try {
      const { product_id, quantity = 1, delivery_address, buyer_notes, delivery_fee = 2000 } = req.body;

      if (!product_id || !delivery_address) {
        return res.status(400).json({
          success: false,
          error: 'Le produit et l\'adresse de livraison sont requis.'
        });
      }

      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(product_id);
      if (!product) {
        return res.status(404).json({ success: false, error: 'Produit introuvable.' });
      }

      if (product.seller_id === req.user.id) {
        return res.status(400).json({
          success: false,
          error: 'Vous ne pouvez pas acheter votre propre produit.'
        });
      }

      const qty = parseFloat(quantity);
      if (qty < (product.min_order_quantity || 1)) {
        return res.status(400).json({
          success: false,
          error: `Quantité minimale requise : ${product.min_order_quantity} ${product.unit}`
        });
      }

      const unitPrice = product.price;
      const subtotal = unitPrice * qty;
      const deliveryFee = parseFloat(delivery_fee);
      const commissionFee = Math.round(subtotal * (config.commissionPercent / 100));
      const totalAmount = subtotal + deliveryFee + commissionFee;

      const orderNumber = `CMD-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      const stmt = db.prepare(`
        INSERT INTO orders 
        (order_number, buyer_id, seller_id, product_id, quantity, unit_price, subtotal, delivery_fee, commission_fee, total_amount, delivery_address, buyer_notes, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'EN_ATTENTE_PAIEMENT')
      `);

      const result = stmt.run(
        orderNumber,
        req.user.id,
        product.seller_id,
        product.id,
        qty,
        unitPrice,
        subtotal,
        deliveryFee,
        commissionFee,
        totalAmount,
        delivery_address,
        buyer_notes || ''
      );

      const orderId = Number(result.lastInsertRowid);

      // Notify seller
      NotificationService.create({
        userId: product.seller_id,
        title: 'Nouvelle Commande Reçue ',
        message: `${req.user.name} a commandé ${qty} ${product.unit} de "${product.name}" (${totalAmount.toLocaleString('fr-FR')} FCFA). En attente de paiement séquestre.`,
        type: 'order',
        referenceId: orderId
      });

      const createdOrder = db.prepare(`
        SELECT o.*, p.name as product_name, p.image_url as product_image, p.unit as product_unit,
               s.name as seller_name, s.phone as seller_phone
        FROM orders o
        JOIN products p ON o.product_id = p.id
        JOIN users s ON o.seller_id = s.id
        WHERE o.id = ?
      `).get(orderId);

      return res.status(201).json({
        success: true,
        message: 'Commande initiée avec succès. Veuillez procéder au paiement en séquestre.',
        order: createdOrder
      });
    } catch (err) {
      console.error('[OrderController.create]', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Get single order by ID
   */
  static getById(req, res) {
    try {
      const { id } = req.params;
      const order = db.prepare(`
        SELECT o.*, p.name as product_name, p.image_url as product_image, p.unit as product_unit,
               b.name as buyer_name, b.phone as buyer_phone, b.location as buyer_location,
               s.name as seller_name, s.phone as seller_phone, s.location as seller_location
        FROM orders o
        JOIN products p ON o.product_id = p.id
        JOIN users b ON o.buyer_id = b.id
        JOIN users s ON o.seller_id = s.id
        WHERE o.id = ?
      `).get(id);

      if (!order) return res.status(404).json({ success: false, error: 'Commande introuvable.' });

      // Check authorization
      if (order.buyer_id !== req.user.id && order.seller_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Non autorisé à consulter cette commande.' });
      }

      // Check for escrow details
      const escrow = db.prepare('SELECT * FROM escrow_transactions WHERE order_id = ?').get(id);

      return res.json({ success: true, order, escrow });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Get all orders for current buyer
   */
  static getBuyerOrders(req, res) {
    try {
      const orders = db.prepare(`
        SELECT o.*, p.name as product_name, p.image_url as product_image, p.unit as product_unit,
               s.name as seller_name, s.phone as seller_phone
        FROM orders o
        JOIN products p ON o.product_id = p.id
        JOIN users s ON o.seller_id = s.id
        WHERE o.buyer_id = ?
        ORDER BY o.created_at DESC
      `).all(req.user.id);

      return res.json({ success: true, count: orders.length, orders });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Get all orders for current seller
   */
  static getSellerOrders(req, res) {
    try {
      const orders = db.prepare(`
        SELECT o.*, p.name as product_name, p.image_url as product_image, p.unit as product_unit,
               b.name as buyer_name, b.phone as buyer_phone, b.location as buyer_location
        FROM orders o
        JOIN products p ON o.product_id = p.id
        JOIN users b ON o.buyer_id = b.id
        WHERE o.seller_id = ?
        ORDER BY o.created_at DESC
      `).all(req.user.id);

      return res.json({ success: true, count: orders.length, orders });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Cancel order (if not yet shipped or paid)
   */
  static cancel(req, res) {
    try {
      const { id } = req.params;
      const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);

      if (!order) return res.status(404).json({ success: false, error: 'Commande introuvable.' });
      if (order.buyer_id !== req.user.id && order.seller_id !== req.user.id) {
        return res.status(403).json({ success: false, error: 'Non autorisé.' });
      }

      if (order.status === 'EXPEDIE' || order.status === 'FONDS_LIBERES') {
        return res.status(400).json({ success: false, error: 'Impossible d\'annuler une commande déjà expédiée ou finalisée.' });
      }

      db.prepare("UPDATE orders SET status = 'ANNULE', updated_at = datetime('now') WHERE id = ?").run(id);

      NotificationService.create({
        userId: order.seller_id,
        title: 'Commande Annulée ',
        message: `La commande ${order.order_number} a été annulée.`,
        type: 'order',
        referenceId: id
      });

      return res.json({ success: true, message: 'Commande annulée.' });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}

module.exports = OrderController;
