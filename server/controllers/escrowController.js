const db = require('../config/db');
const EscrowService = require('../services/escrowService');
const NotificationService = require('../services/notificationService');

class EscrowController {
  /**
   * Pay order into Escrow (MTN MoMo / Orange Money)
   */
  static async payEscrow(req, res) {
    try {
      const { order_id, payment_operator = 'MTN_MOMO', payment_phone } = req.body;

      if (!order_id || !payment_phone) {
        return res.status(400).json({
          success: false,
          error: 'Le numéro de commande et le numéro Mobile Money sont obligatoires.'
        });
      }

      const result = EscrowService.lockFunds({
        orderId: parseInt(order_id, 10),
        buyerId: req.user.id,
        paymentOperator: payment_operator,
        paymentPhone: payment_phone
      });

      return res.json({
        success: true,
        message: 'Paiement Mobile Money validé avec succès. Fonds sécurisés en Séquestre (Escrow) !',
        data: result
      });
    } catch (err) {
      console.error('[EscrowController.payEscrow]', err);
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  /**
   * Seller ships product
   */
  static shipOrder(req, res) {
    try {
      const { order_id, tracking_code } = req.body;
      if (!order_id) {
        return res.status(400).json({ success: false, error: 'ID de commande requis.' });
      }

      const result = EscrowService.shipOrder(
        parseInt(order_id, 10),
        req.user.id,
        tracking_code
      );

      return res.json({
        success: true,
        message: 'Commande marquée comme expédiée.',
        data: result
      });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  /**
   * Buyer confirms delivery -> Escrow release to Seller
   */
  static releaseFunds(req, res) {
    try {
      const { order_id } = req.body;
      if (!order_id) {
        return res.status(400).json({ success: false, error: 'ID de commande requis.' });
      }

      const result = EscrowService.releaseFunds(
        parseInt(order_id, 10),
        req.user.id
      );

      return res.json({
        success: true,
        message: 'Félicitations ! Réception confirmée et fonds débloqués au producteur.',
        data: result
      });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  /**
   * Raise dispute
   */
  static dispute(req, res) {
    try {
      const { order_id, reason } = req.body;
      if (!order_id || !reason) {
        return res.status(400).json({ success: false, error: 'ID de commande et motif de litige requis.' });
      }

      const result = EscrowService.raiseDispute(
        parseInt(order_id, 10),
        req.user.id,
        reason
      );

      return res.json({
        success: true,
        message: 'Litige ouvert. L\'équipe d\'arbitrage AgroElevage prend en charge le dossier.',
        data: result
      });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }

  /**
   * Get user wallet & escrow summary
   */
  static getWallet(req, res) {
    try {
      const user = db.prepare('SELECT wallet_balance, escrow_balance FROM users WHERE id = ?').get(req.user.id);
      
      const transactions = db.prepare(`
        SELECT e.*, o.order_number 
        FROM escrow_transactions e
        JOIN orders o ON e.order_id = o.id
        WHERE e.buyer_id = ? OR e.seller_id = ?
        ORDER BY e.created_at DESC
      `).all(req.user.id, req.user.id);

      return res.json({
        success: true,
        wallet: {
          availableBalance: user.wallet_balance,
          escrowBalance: user.escrow_balance,
          currency: 'FCFA'
        },
        transactions
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Withdraw funds from wallet to Mobile Money
   */
  static withdraw(req, res) {
    try {
      const { amount, phone, operator = 'MTN_MOMO' } = req.body;
      const withdrawAmount = parseFloat(amount);

      if (!withdrawAmount || withdrawAmount <= 0) {
        return res.status(400).json({ success: false, error: 'Montant invalide.' });
      }

      const user = db.prepare('SELECT wallet_balance FROM users WHERE id = ?').get(req.user.id);
      if (user.wallet_balance < withdrawAmount) {
        return res.status(400).json({ success: false, error: 'Solde disponible insuffisant pour ce retrait.' });
      }

      db.prepare('UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?').run(withdrawAmount, req.user.id);

      NotificationService.create({
        userId: req.user.id,
        title: 'Retrait Mobile Money Effectué ',
        message: `Votre virement de ${withdrawAmount.toLocaleString('fr-FR')} FCFA vers le compte ${operator} (${phone || req.user.phone}) a été exécuté.`,
        type: 'escrow'
      });

      return res.json({
        success: true,
        message: `Retrait de ${withdrawAmount.toLocaleString('fr-FR')} FCFA validé. Fonds transférés vers votre compte Mobile Money.`,
        remainingBalance: user.wallet_balance - withdrawAmount
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}

module.exports = EscrowController;
