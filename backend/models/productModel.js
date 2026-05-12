const db = require('../config/db');

class ProductModel {
    static async getAllProducts() {
        const [rows] = await db.query('SELECT * FROM products');
        return rows;
    }

    static async getProductById(id) {
        const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
        return rows[0];
    }

    static async createProduct(data) {
        const { name, description, price, image, category } = data;
        const [result] = await db.query(
            'INSERT INTO products (name, description, price, image, category) VALUES (?, ?, ?, ?, ?)',
            [name, description, price, image, category]
        );
        return result;
    }

    static async updateProduct(id, data) {
        const { name, description, price, image, category } = data;
        const [result] = await db.query(
            'UPDATE products SET name = ?, description = ?, price = ?, image = ?, category = ? WHERE id = ?',
            [name, description, price, image, category, id]
        );
        return result;
    }

    static async deleteProduct(id) {
        const [result] = await db.query('DELETE FROM products WHERE id = ?', [id]);
        return result;
    }
}

module.exports = ProductModel;
