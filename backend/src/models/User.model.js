import db from '../config/db.js';

class User {
  static async findByEmail(email) {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.execute('SELECT id, full_name, email, role, created_at FROM users WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(userData) {
    const { full_name, email, password, role = 'customer' } = userData;
    const [result] = await db.execute(
      'INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)',
      [full_name, email, password, role]
    );
    return result.insertId;
  }

  static async findAll() {
    const [rows] = await db.execute('SELECT id, full_name, email, role, created_at FROM users ORDER BY id DESC');
    return rows;
  }
}

export default User;
