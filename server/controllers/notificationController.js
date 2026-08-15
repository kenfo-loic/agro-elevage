const NotificationService = require('../services/notificationService');

class NotificationController {
  /**
   * Get notifications for authenticated user
   */
  static getAll(req, res) {
    try {
      const notifications = NotificationService.getForUser(req.user.id);
      const unreadCount = NotificationService.getUnreadCount(req.user.id);

      return res.json({
        success: true,
        unreadCount,
        notifications
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Mark single notification as read
   */
  static markAsRead(req, res) {
    try {
      const { id } = req.params;
      NotificationService.markAsRead(id, req.user.id);
      return res.json({ success: true, message: 'Notification marquée comme lue.' });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }

  /**
   * Mark all notifications as read
   */
  static markAllAsRead(req, res) {
    try {
      NotificationService.markAllAsRead(req.user.id);
      return res.json({ success: true, message: 'Toutes les notifications ont été marquées comme lues.' });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
}

module.exports = NotificationController;
