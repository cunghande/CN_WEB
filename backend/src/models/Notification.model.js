import db from '../config/db.js';

class Notification {
  static async findByUserId(userId) {
    const [rows] = await db.execute(
      `SELECT n.*, actor.full_name AS actor_name
       FROM notifications n
       LEFT JOIN users actor ON n.actor_user_id = actor.id
       WHERE n.user_id = ?
       ORDER BY n.id DESC
       LIMIT 50`,
      [userId]
    );
    return rows;
  }

  static async create({
    user_id,
    actor_user_id = null,
    order_id = null,
    title,
    message,
    type = 'order',
    target_url = null,
    entity_type = null,
    entity_id = null
  }) {
    const [result] = await db.execute(
      `INSERT INTO notifications
       (user_id, actor_user_id, order_id, title, message, type, target_url, entity_type, entity_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, actor_user_id, order_id, title, message, type, target_url, entity_type, entity_id]
    );
    return result.insertId;
  }

  static async createForAdmins(payload) {
    const [admins] = await db.execute('SELECT id FROM users WHERE role = ?', ['admin']);
    for (const admin of admins) {
      if (admin.id === payload.actor_user_id) continue;
      await this.create({ ...payload, user_id: admin.id });
    }
    return admins.length;
  }

  static async exists({ user_id, order_id = null, type, entity_type = null, entity_id = null }) {
    const [rows] = await db.execute(
      `SELECT id FROM notifications
       WHERE user_id = ?
         AND (order_id <=> ?)
         AND type = ?
         AND (entity_type <=> ?)
         AND (entity_id <=> ?)
       LIMIT 1`,
      [user_id, order_id, type, entity_type, entity_id]
    );
    return Boolean(rows[0]);
  }

  static async markRead(id, userId) {
    await db.execute('UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?', [id, userId]);
    const [rows] = await db.execute('SELECT * FROM notifications WHERE id = ? AND user_id = ?', [id, userId]);
    return rows[0] || null;
  }

  static async markAllRead(userId) {
    await db.execute('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [userId]);
    return true;
  }
}

export default Notification;
