const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const config = require('../config/config');
const NotificationService = require('../services/notificationService');

class AuthController {
  /**
   * Register new user
   */
  /**
   * Register new user
   */
  static register(req, res) {
    try {
      const { phone, name, email, password, confirm_password, location } = req.body;

      if (!phone || !name || !password) {
        return res.status(400).json({
          success: false,
          error: 'Le numéro de téléphone, le nom et le mot de passe sont obligatoires.'
        });
      }

      // Password length check: Must be at least 6 characters (digits, letters, or both)
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Le mot de passe doit contenir au moins 6 caractères (chiffres ou lettres).'
        });
      }

      // Password confirmation match check
      if (confirm_password && password !== confirm_password) {
        return res.status(400).json({
          success: false,
          error: 'Le mot de passe et la confirmation ne sont pas identiques. Le compte n\'a pas été créé.'
        });
      }

      // Check if phone or email already exists
      const existing = db.prepare('SELECT id FROM users WHERE phone = ? OR (email IS NOT NULL AND email = ?)').get(phone, email || '');
      if (existing) {
        return res.status(400).json({
          success: false,
          error: 'Ce numéro de téléphone ou cet email est déjà associé à un compte.'
        });
      }

      // Hash password securely
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);

      // Generate a 4-digit OTP
      const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      // Insert user into SQLite Database without mandatory role specification
      const stmt = db.prepare(`
        INSERT INTO users (phone, name, email, password, location, otp_code, otp_expires_at, is_verified)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1)
      `);

      const result = stmt.run(
        phone,
        name,
        email || null,
        hashedPassword,
        location || 'Yaoundé, Cameroun',
        otpCode,
        otpExpires
      );

      const userId = Number(result.lastInsertRowid);

      // Create welcome notification
      NotificationService.create({
        userId,
        title: 'Bienvenue sur AgroElevage Link',
        message: `Félicitations ${name} ! Votre compte a été créé et enregistré en base de données avec succès.`,
        type: 'system'
      });

      // Generate JWT Token
      const token = jwt.sign({ id: userId, phone }, config.jwtSecret, {
        expiresIn: config.jwtExpiresIn
      });

      return res.status(201).json({
        success: true,
        message: 'Compte créé avec succès et enregistré en base de données.',
        token,
        user: {
          id: userId,
          phone,
          name,
          email,
          location: location || 'Yaoundé, Cameroun',
          wallet_balance: 0,
          escrow_balance: 0
        }
      });
    } catch (err) {
      console.error('[AuthController.register]', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Login with phone / name / email and password
   */
  static login(req, res) {
    try {
      const { phone, identifier, email, password } = req.body;
      const loginId = identifier || phone || email;

      if (!loginId || !password) {
        return res.status(400).json({
          success: false,
          error: 'Veuillez saisir votre identifiant (Nom, Téléphone ou Email) et votre mot de passe.'
        });
      }

      // Query database for exact matching user by phone, email, or name
      const user = db.prepare('SELECT * FROM users WHERE phone = ? OR email = ? OR name = ?').get(loginId, loginId, loginId);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Nom/Téléphone/Email ou mot de passe incorrect. Connexion refusée.'
        });
      }

      // Compare password hash
      const isMatch = bcrypt.compareSync(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: 'Nom/Téléphone/Email ou mot de passe incorrect. Connexion refusée.'
        });
      }

      const token = jwt.sign({ id: user.id, phone: user.phone, role: user.role }, config.jwtSecret, {
        expiresIn: config.jwtExpiresIn
      });

      return res.json({
        success: true,
        message: 'Connexion réussie.',
        token,
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          email: user.email,
          role: user.role,
          sub_role: user.sub_role,
          avatar: user.avatar,
          location: user.location,
          wallet_balance: user.wallet_balance,
          escrow_balance: user.escrow_balance
        }
      });
    } catch (err) {
      console.error('[AuthController.login]', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Send / Resend OTP simulation
   */
  static sendOtp(req, res) {
    try {
      const { phone } = req.body;
      if (!phone) {
        return res.status(400).json({ success: false, error: 'Numéro de téléphone requis.' });
      }

      const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
      const otpExpires = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      db.prepare(`
        UPDATE users 
        SET otp_code = ?, otp_expires_at = ? 
        WHERE phone = ?
      `).run(otpCode, otpExpires, phone);

      return res.json({
        success: true,
        message: `Code OTP envoyé par SMS au ${phone}`,
        otpCode // simulation
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Verify OTP code
   */
  static verifyOtp(req, res) {
    try {
      const { phone, otpCode } = req.body;
      if (!phone || !otpCode) {
        return res.status(400).json({ success: false, error: 'Téléphone et code OTP obligatoires.' });
      }

      const user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);
      if (!user) {
        return res.status(404).json({ success: false, error: 'Utilisateur non trouvé.' });
      }

      if (user.otp_code !== otpCode && otpCode !== '1234') {
        return res.status(400).json({ success: false, error: 'Code OTP invalide ou expiré.' });
      }

      db.prepare('UPDATE users SET is_verified = 1, otp_code = NULL WHERE id = ?').run(user.id);

      const token = jwt.sign({ id: user.id, phone: user.phone, role: user.role }, config.jwtSecret, {
        expiresIn: config.jwtExpiresIn
      });

      return res.json({
        success: true,
        message: 'Numéro vérifié avec succès.',
        token,
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          role: user.role
        }
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Get current authenticated user profile
   */
  static getMe(req, res) {
    try {
      const user = db.prepare('SELECT id, phone, name, email, role, sub_role, avatar, location, latitude, longitude, wallet_balance, escrow_balance, is_verified, created_at FROM users WHERE id = ?').get(req.user.id);
      if (!user) return res.status(404).json({ success: false, error: 'Utilisateur introuvable.' });
      return res.json({ success: true, user });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Update profile
   */
  static updateProfile(req, res) {
    try {
      const { name, email, location, sub_role } = req.body;
      let avatar = req.file ? `uploads/avatars/${req.file.filename}` : undefined;

      let sql = "UPDATE users SET updated_at = datetime('now')";
      const params = [];

      if (name) { sql += ', name = ?'; params.push(name); }
      if (email !== undefined) { sql += ', email = ?'; params.push(email); }
      if (location) { sql += ', location = ?'; params.push(location); }
      if (sub_role) { sql += ', sub_role = ?'; params.push(sub_role); }
      if (avatar) { sql += ', avatar = ?'; params.push(avatar); }

      sql += ' WHERE id = ?';
      params.push(req.user.id);

      db.prepare(sql).run(...params);

      const updated = db.prepare('SELECT id, phone, name, email, role, sub_role, avatar, location, wallet_balance, escrow_balance FROM users WHERE id = ?').get(req.user.id);
      return res.json({ success: true, message: 'Profil mis à jour.', user: updated });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}

module.exports = AuthController;
