const db = require('../config/db');

// Get DB stats & tables list (Admin only)
exports.getDatabaseOverview = (req, res) => {
  try {
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
    
    const overview = tables.map(t => {
      const countObj = db.prepare(`SELECT COUNT(*) as total FROM ${t.name}`).get();
      return {
        table: t.name,
        totalRecords: countObj ? countObj.total : 0
      };
    });

    res.json({
      success: true,
      tables: overview,
      dbPath: 'server/database/agroelevage.db'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get All Users (Admin)
exports.getAllUsers = (req, res) => {
  try {
    const users = db.prepare(`
      SELECT id, phone, name, email, role, sub_role, location, wallet_balance, escrow_balance, is_verified, is_active, created_at 
      FROM users 
      ORDER BY id DESC
    `).all();

    res.json({
      success: true,
      users,
      count: users.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete User (Admin)
exports.deleteUser = (req, res) => {
  try {
    const { userId } = req.params;
    const user = db.prepare('SELECT id, name, role FROM users WHERE id = ?').get(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'Utilisateur introuvable.' });
    }

    if (user.role === 'admin' && String(user.id) === String(req.user.id)) {
      return res.status(400).json({ success: false, error: 'Impossible de supprimer votre propre compte administrateur.' });
    }

    // Delete associated products, notifications and orders
    db.prepare('DELETE FROM products WHERE seller_id = ?').run(userId);
    db.prepare('DELETE FROM notifications WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM users WHERE id = ?').run(userId);

    res.json({
      success: true,
      message: `Utilisateur "${user.name}" et ses récoltes associées ont été supprimés définitivement.`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get All Products (Admin)
exports.getAllProducts = (req, res) => {
  try {
    const products = db.prepare(`
      SELECT p.*, u.name as seller_name, u.phone as seller_phone 
      FROM products p
      LEFT JOIN users u ON p.seller_id = u.id
      ORDER BY p.id DESC
    `).all();

    res.json({
      success: true,
      products,
      count: products.length
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete Product (Admin)
exports.deleteProduct = (req, res) => {
  try {
    const { productId } = req.params;
    const product = db.prepare('SELECT id, name FROM products WHERE id = ?').get(productId);
    
    if (!product) {
      return res.status(404).json({ success: false, error: 'Produit introuvable.' });
    }

    db.prepare('DELETE FROM products WHERE id = ?').run(productId);

    res.json({
      success: true,
      message: `Produit "${product.name}" supprimé avec succès de toute la plateforme.`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update Product (Admin)
exports.updateProduct = (req, res) => {
  try {
    const { productId } = req.params;
    const { name, category, price, stock_quantity, unit, location, is_available } = req.body;

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Produit introuvable.' });
    }

    db.prepare(`
      UPDATE products 
      SET name = COALESCE(?, name),
          category = COALESCE(?, category),
          price = COALESCE(?, price),
          stock_quantity = COALESCE(?, stock_quantity),
          unit = COALESCE(?, unit),
          location = COALESCE(?, location),
          is_available = COALESCE(?, is_available),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, category, price, stock_quantity, unit, location, is_available, productId);

    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);

    res.json({
      success: true,
      message: `Produit "${updated.name}" mis à jour avec succès par l'administrateur.`,
      product: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get records for a specific table (Admin only)
exports.getTableRecords = (req, res) => {
  try {
    const { tableName } = req.params;
    
    const validTables = ['users', 'products', 'orders', 'escrow_transactions', 'notifications', 'ai_diagnostics'];
    if (!validTables.includes(tableName)) {
      return res.status(400).json({ success: false, error: 'Table non autorisée ou introuvable.' });
    }

    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const rows = db.prepare(`SELECT * FROM ${tableName} ORDER BY id DESC LIMIT ? OFFSET ?`).all(limit, offset);
    const countObj = db.prepare(`SELECT COUNT(*) as total FROM ${tableName}`).get();

    res.json({
      success: true,
      table: tableName,
      totalRecords: countObj ? countObj.total : rows.length,
      limit,
      offset,
      data: rows
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Toggle User Active/Blocked Status (Admin only)
exports.toggleUserBlock = (req, res) => {
  try {
    const { userId } = req.params;
    const user = db.prepare('SELECT id, name, role, is_active FROM users WHERE id = ?').get(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'Utilisateur introuvable.' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, error: 'Impossible de bloquer le compte administrateur principal.' });
    }

    const newStatus = (user.is_active === 0) ? 1 : 0;
    db.prepare('UPDATE users SET is_active = ? WHERE id = ?').run(newStatus, userId);

    res.json({
      success: true,
      message: `Utilisateur ${user.name} ${newStatus === 1 ? 'débloqué' : 'bloqué'} avec succès.`,
      is_active: newStatus
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Export Full DB Data (Admin only)
exports.exportDatabaseJSON = (req, res) => {
  try {
    const tables = ['users', 'products', 'orders', 'escrow_transactions', 'notifications'];
    const backupData = {};

    tables.forEach(tableName => {
      backupData[tableName] = db.prepare(`SELECT * FROM ${tableName}`).all();
    });

    res.json({
      success: true,
      exportedAt: new Date().toISOString(),
      backup: backupData
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
