const db = require('../config/db');
const NotificationService = require('./notificationService');
const config = require('../config/config');

class EscrowService {
  /**
   * Lock funds in Escrow for an order (MTN MoMo or Orange Money simulation)
   */
  static lockFunds({ orderId, buyerId, paymentOperator = 'MTN_MOMO', paymentPhone }) {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    if (!order) {
      throw new Error('Commande introuvable.');
    }

    if (order.buyer_id !== buyerId) {
      throw new Error('Non autorisé à payer cette commande.');
    }

    if (order.status !== 'EN_ATTENTE_PAIEMENT') {
      throw new Error(`Impossible de payer une commande au statut : ${order.status}`);
    }

    const paymentRef = `${paymentOperator.startsWith('ORANGE') ? 'OM' : 'MOMO'}-ESCROW-${Date.now().toString().slice(-8)}`;
    const fee = order.commission_fee || Math.round(order.subtotal * (config.commissionPercent / 100));

    try {
      db.exec('BEGIN TRANSACTION;');

      // 1. Update Order Status
      db.prepare(`
        UPDATE orders 
        SET status = 'FONDS_BLOQUES_SEQUESTRE',
            payment_method = ?,
            payment_phone = ?,
            paid_at = datetime('now'),
            updated_at = datetime('now')
        WHERE id = ?
      `).run(paymentOperator, paymentPhone, orderId);

      // 2. Create Escrow Transaction
      const escrowInsert = db.prepare(`
        INSERT INTO escrow_transactions 
        (order_id, buyer_id, seller_id, amount, fee, status, payment_reference, payment_operator, locked_at)
        VALUES (?, ?, ?, ?, ?, 'HELD', ?, ?, datetime('now'))
      `).run(orderId, order.buyer_id, order.seller_id, order.total_amount, fee, paymentRef, paymentOperator);

      // 3. Update Seller & Buyer escrow balances
      db.prepare('UPDATE users SET escrow_balance = escrow_balance + ? WHERE id = ?').run(order.total_amount, order.seller_id);

      db.exec('COMMIT;');

      // 4. Send Notifications
      NotificationService.create({
        userId: order.buyer_id,
        title: 'Paiement Séquestre Validé ',
        message: `Votre paiement de ${order.total_amount.toLocaleString('fr-FR')} FCFA pour la commande ${order.order_number} est sécurisé en séquestre. Les fonds ne seront versés au vendeur qu'après votre confirmation de livraison.`,
        type: 'escrow',
        referenceId: orderId
      });

      NotificationService.create({
        userId: order.seller_id,
        title: 'Paiement Sécurisé Reçu ',
        message: `La commande ${order.order_number} (${order.subtotal.toLocaleString('fr-FR')} FCFA) a été payée et sécurisée en séquestre. Vous pouvez préparer et expédier les produits en toute sérénité.`,
        type: 'order',
        referenceId: orderId
      });

      return {
        escrowId: Number(escrowInsert.lastInsertRowid),
        paymentReference: paymentRef,
        status: 'FONDS_BLOQUES_SEQUESTRE',
        amountLocked: order.total_amount
      };
    } catch (err) {
      db.exec('ROLLBACK;');
      throw err;
    }
  }

  /**
   * Seller marks order as shipped
   */
  static shipOrder(orderId, sellerId, trackingCode = null) {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    if (!order) throw new Error('Commande introuvable.');
    if (order.seller_id !== sellerId) throw new Error('Non autorisé.');
    if (order.status !== 'FONDS_BLOQUES_SEQUESTRE' && order.status !== 'EN_PREPARATION') {
      throw new Error('La commande doit être payée en séquestre avant expédition.');
    }

    const generatedTracking = trackingCode || `TRK-AGO-${Math.floor(100000 + Math.random() * 900000)}`;

    db.prepare(`
      UPDATE orders 
      SET status = 'EXPEDIE',
          tracking_code = ?,
          shipped_at = datetime('now'),
          updated_at = datetime('now')
      WHERE id = ?
    `).run(generatedTracking, orderId);

    NotificationService.create({
      userId: order.buyer_id,
      title: 'Commande Expédiée ',
      message: `Votre commande ${order.order_number} est en route ! Code de suivi : ${generatedTracking}.`,
      type: 'order',
      referenceId: orderId
    });

    return { success: true, status: 'EXPEDIE', trackingCode: generatedTracking };
  }

  /**
   * Buyer confirms receipt -> Release Escrow Funds to Seller Wallet
   */
  static releaseFunds(orderId, buyerId) {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    if (!order) throw new Error('Commande introuvable.');
    if (order.buyer_id !== buyerId) throw new Error('Seul l\'acheteur peut valider la réception et libérer les fonds.');

    if (order.status !== 'EXPEDIE' && order.status !== 'LIVRE_NON_CONFIRME' && order.status !== 'FONDS_BLOQUES_SEQUESTRE') {
      throw new Error(`Statut invalide pour déblocage des fonds : ${order.status}`);
    }

    const escrowTx = db.prepare("SELECT * FROM escrow_transactions WHERE order_id = ? AND status = 'HELD'").get(orderId);
    if (!escrowTx) throw new Error('Aucune transaction de séquestre active trouvée pour cette commande.');

    const payoutAmount = order.subtotal; // Vendeur reçoit le montant net des produits

    try {
      db.exec('BEGIN TRANSACTION;');

      // 1. Update Order Status
      db.prepare(`
        UPDATE orders 
        SET status = 'FONDS_LIBERES',
            delivered_at = datetime('now'),
            completed_at = datetime('now'),
            updated_at = datetime('now')
        WHERE id = ?
      `).run(orderId);

      // 2. Update Escrow record
      db.prepare(`
        UPDATE escrow_transactions 
        SET status = 'RELEASED',
            released_at = datetime('now')
        WHERE id = ?
      `).run(escrowTx.id);

      // 3. Credit Seller Wallet and reduce Escrow Balance
      db.prepare('UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?').run(payoutAmount, order.seller_id);
      db.prepare('UPDATE users SET escrow_balance = CASE WHEN escrow_balance > ? THEN escrow_balance - ? ELSE 0 END WHERE id = ?').run(order.total_amount, order.total_amount, order.seller_id);

      db.exec('COMMIT;');

      // 4. Dispatch Notifications
      NotificationService.create({
        userId: order.seller_id,
        title: 'Fonds Débloqués sur votre Portefeuille ',
        message: `L'acheteur a confirmé la réception de la commande ${order.order_number}. La somme de ${payoutAmount.toLocaleString('fr-FR')} FCFA a été créditée sur votre solde disponible.`,
        type: 'escrow',
        referenceId: orderId
      });

      NotificationService.create({
        userId: order.buyer_id,
        title: 'Transaction Clôturée avec Succès ',
        message: `Merci d'avoir confirmé la réception de la commande ${order.order_number}. Votre confirmation a libéré les fonds au producteur.`,
        type: 'order',
        referenceId: orderId
      });

      return {
        success: true,
        orderId,
        status: 'FONDS_LIBERES',
        payoutAmount
      };
    } catch (err) {
      db.exec('ROLLBACK;');
      throw err;
    }
  }

  /**
   * Raise a dispute on an order
   */
  static raiseDispute(orderId, userId, reason) {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    if (!order) throw new Error('Commande introuvable.');
    if (order.buyer_id !== userId && order.seller_id !== userId) {
      throw new Error('Non autorisé à ouvrir un litige sur cette commande.');
    }

    db.prepare(`
      UPDATE orders 
      SET status = 'LITIGE',
          buyer_notes = COALESCE(buyer_notes, '') || '\n[LITIGE OUVERT]: ' || ?,
          updated_at = datetime('now')
      WHERE id = ?
    `).run(reason, orderId);

    NotificationService.create({
      userId: order.buyer_id,
      title: 'Litige Ouvert ',
      message: `Un litige a été ouvert pour la commande ${order.order_number}. Les fonds restent protégés en séquestre pendant la médiation.`,
      type: 'escrow',
      referenceId: orderId
    });

    NotificationService.create({
      userId: order.seller_id,
      title: 'Litige Ouvert ',
      message: `Un litige a été ouvert pour la commande ${order.order_number}. Motif : ${reason}. Le support AgroElevage examine le dossier.`,
      type: 'escrow',
      referenceId: orderId
    });

    return { success: true, status: 'LITIGE' };
  }

  /**
   * Get escrow details for order
   */
  static getEscrowDetails(orderId) {
    return db.prepare(`
      SELECT e.*, o.order_number, o.total_amount, o.status as order_status,
             b.name as buyer_name, b.phone as buyer_phone,
             s.name as seller_name, s.phone as seller_phone
      FROM escrow_transactions e
      JOIN orders o ON e.order_id = o.id
      JOIN users b ON e.buyer_id = b.id
      JOIN users s ON e.seller_id = s.id
      WHERE e.order_id = ?
    `).get(orderId);
  }
}

module.exports = EscrowService;
