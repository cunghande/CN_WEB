import db from '../config/db.js';

class Order {
  static async create(orderData) {
    const { user_id, items, subtotal_amount, shipping_fee, total_amount, address, shipping_note } = orderData;
    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      const [result] = await connection.execute(
        `INSERT INTO orders
        (user_id, subtotal_amount, shipping_fee, total_amount, status, receiver_name, receiver_phone,
         province_code, province_name, district_code, district_name, ward_code, ward_name, hamlet, address_line, shipping_note)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user_id,
          subtotal_amount,
          shipping_fee,
          total_amount,
          'pending',
          address.receiver_name,
          address.receiver_phone,
          address.province_code,
          address.province_name,
          address.district_code,
          address.district_name,
          address.ward_code,
          address.ward_name,
          address.hamlet || '',
          address.address_line,
          shipping_note || ''
        ]
      );
      const orderId = result.insertId;

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

      await connection.execute(
        'INSERT INTO notifications (user_id, order_id, title, message, type) VALUES (?, ?, ?, ?, ?)',
        [user_id, orderId, 'Đơn hàng đã được tạo', `Đơn hàng #${orderId} đang chờ xử lý.`, 'order']
      );

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
    const [orders] = await db.execute('SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC', [userId]);
    return orders;
  }

  static async updateStatus(id, status) {
    const order = await this.findById(id);
    await db.execute('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    return order;
  }
}

export default Order;
