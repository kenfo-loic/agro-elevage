const jwt = require('jsonwebtoken');
const config = require('../config/config');
const db = require('../config/db');

function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Accès refusé. Jeton d\'authentification manquant.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret);

    const user = db.prepare('SELECT id, phone, name, email, role, sub_role, location, wallet_balance, escrow_balance FROM users WHERE id = ?').get(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Utilisateur introuvable ou session expirée.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Jeton d\'authentification invalide ou expiré.',
      details: error.message
    });
  }
}

// Optional Auth (passes if token present, proceeds if absent)
function optionalAuthMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.jwtSecret);
      const user = db.prepare('SELECT id, phone, name, email, role, sub_role, location, wallet_balance, escrow_balance FROM users WHERE id = ?').get(decoded.id);
      if (user) req.user = user;
    }
  } catch (e) {
    // Ignore invalid optional tokens
  }
  next();
}

// Role authorization middleware
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Accès interdit. Rôle(s) autorisé(s) : ${roles.join(', ')}`
      });
    }
    next();
  };
}

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
  requireRole
};
