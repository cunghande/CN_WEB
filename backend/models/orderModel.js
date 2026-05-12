const db = require('../config/db');

class OrderModel {
    static async getAllOrders() {
        const [rows] = await db.query('SELECT * FROM orders');
        return rows;
    }

    static async getOrderById(id) {
        const [rows] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
        return rows[0];
    }

    static async getOrdersByUserId(userId) {
        const [rows] = await db.query('SELECT * FROM orders WHERE user_id = ?', [userId]);
        return rows;
    }

    static async createOrder(data) {
        const { user_id, total_price, status, items } = data;
        const [result] = await db.query(
            'INSERT INTO orders (user_id, total_price, status, created_at) VALUES (?, ?, ?, NOW())',
            [user_id, total_price, status]
        );
        return result;
    }

    static async updateOrder(id, data) {
        const { status } = data;
        const [result] = await db.query(
            'UPDATE orders SET status = ? WHERE id = ?',
            [status, id]
        );
        return result;
    }

    static async deleteOrder(id) {
        const [result] = await db.query('DELETE FROM orders WHERE id = ?', [id]);
        return result;
    }
}

module.exports = OrderModel;
