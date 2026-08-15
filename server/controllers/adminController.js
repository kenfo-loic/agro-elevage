const db = require('../config/db');

// Get DB stats & tables list (Admin only)
exports.getDatabaseOverview = (req, res) => {
  try {
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
    
    const overview = tables.map(t => {
      const countObj = db.prepare(`SELECT COUNT(*) as total FROM ${t.name}`).get();
      return {
        table: t.name,
        totalRecords: countObj.total
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

// Get records for a specific table (Admin only)
exports.getTableRecords = (req, res) => {
  try {
    const { tableName } = req.params;
    
    // Whitelist valid tables to prevent SQL injection
    const validTables = ['users', 'products', 'orders', 'escrow_transactions', 'notifications', 'audit_logs'];
    if (!validTables.includes(tableName)) {
      return res.status(400).json({ success: false, error: 'Table non autorisée ou introuvable.' });
    }

    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const rows = db.prepare(`SELECT * FROM ${tableName} ORDER BY rowid DESC LIMIT ? OFFSET ?`).all(limit, offset);
    const countObj = db.prepare(`SELECT COUNT(*) as total FROM ${tableName}`).get();

    res.json({
      success: true,
      table: tableName,
      totalRecords: countObj.total,
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
