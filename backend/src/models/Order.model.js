import db from '../config/db.js';

class Order {
  static async create(orderData) {
    const { user_id, items, total_amount } = orderData;
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      const [result] = await connection.execute(
        'INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)',
        [user_id, total_amount, 'pending']
      );
      const orderId = result.insertId;

      // Tạo chi tiết đơn hàng và trừ tồn kho trong cùng transaction.
      for (const item of items) {
        await connection.execute(
          'INSERT INTO order_items (order_id, variant_id, quantity, unit_price) VALUES (?, ?, ?, ?)',
          [orderId, item.variant_id, item.quantity, item.unit_price]
        );

        await connection.execute(
          'UPDATE product_variants SET stock_quantity = GREATEST(0, stock_quantity - ?) WHERE id = ?',
          [item.quantity, item.variant_id]
        );
      }

      await connection.commit();
      return orderId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async findById(id) {
    const [orders] = await db.execute(`
      SELECT o.*, u.full_name, u.email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = ?
    `, [id]);

    if (!orders[0]) return null;

    const order = orders[0];
    const [items] = await db.execute(`
      SELECT oi.*, v.size, v.color, p.name as product_name, p.image_url
      FROM order_items oi
      JOIN product_variants v ON oi.variant_id = v.id
      JOIN products p ON v.product_id = p.id
      WHERE oi.order_id = ?
    `, [id]);

    order.items = items;
    return order;
  }

  static async findAll() {
    const [orders] = await db.execute(`
      SELECT o.*, u.full_name, u.email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.id DESC
    `);
    return orders;
  }

  static async findByUserId(userId) {
    const [orders] = await db.execute(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC',
      [userId]
    );
    return orders;
  }

  static async updateStatus(id, status) {
    await db.execute('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    return true;
  }
}

export default Order;
