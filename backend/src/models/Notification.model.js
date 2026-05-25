import db from '../config/db.js';

class Notification {
  static async findByUserId(userId) {
    const [rows] = await db.execute(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC LIMIT 50',
      [userId]
    );
    return rows;
  }

  static async create({ user_id, order_id = null, title, message, type = 'order' }) {
    const [result] = await db.execute(
      'INSERT INTO notifications (user_id, order_id, title, message, type) VALUES (?, ?, ?, ?, ?)',
      [user_id, order_id, title, message, type]
    );
    return result.insertId;
  }

  static async markRead(id, userId) {
    await db.execute('UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?', [id, userId]);
    return true;
  }

  static async markAllRead(userId) {
    await db.execute('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [userId]);
    return true;
  }
}

export default Notification;
