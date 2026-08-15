const db = require('../config/db');

class NotificationService {
  /**
   * Create a notification for a user
   */
  static create({ userId, title, message, type = 'system', referenceId = null }) {
    try {
      const stmt = db.prepare(`
        INSERT INTO notifications (user_id, title, message, type, reference_id, is_read)
        VALUES (?, ?, ?, ?, ?, 0)
      `);
      const result = stmt.run(userId, title, message, type, referenceId);
      return { id: result.lastInsertRowid, userId, title, message, type, referenceId };
    } catch (err) {
      console.error('[NotificationService] Error creating notification:', err);
      return null;
    }
  }

  /**
   * Get all notifications for a user
   */
  static getForUser(userId, limit = 50) {
    return db.prepare(`
      SELECT * FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `).all(userId, limit);
  }

  /**
   * Mark a notification as read
   */
  static markAsRead(notificationId, userId) {
    return db.prepare(`
      UPDATE notifications 
      SET is_read = 1 
      WHERE id = ? AND user_id = ?
    `).run(notificationId, userId);
  }

  /**
   * Mark all as read for user
   */
  static markAllAsRead(userId) {
    return db.prepare(`
      UPDATE notifications 
      SET is_read = 1 
      WHERE user_id = ?
    `).run(userId);
  }

  /**
   * Get unread count
   */
  static getUnreadCount(userId) {
    return db.prepare(`
      SELECT COUNT(*) as count FROM notifications 
      WHERE user_id = ? AND is_read = 0
    `).get(userId).count;
  }
}

module.exports = NotificationService;
