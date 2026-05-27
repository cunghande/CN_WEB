import db from '../config/db.js';

class User {
  static async findByEmail(email) {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT id, full_name, email, role, avatar_url, phone, gender, theme_preference, created_at FROM users WHERE id = ?',
      [id]
    );
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
    const [rows] = await db.execute('SELECT id, full_name, email, role, avatar_url, phone, gender, theme_preference, created_at FROM users ORDER BY id DESC');
    return rows;
  }

  static async findPublicById(id) {
    const [rows] = await db.execute(
      'SELECT id, full_name, avatar_url, gender, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async updateProfile(id, profileData) {
    const { full_name, phone, gender, theme_preference } = profileData;
    await db.execute(
      'UPDATE users SET full_name = ?, phone = ?, gender = ?, theme_preference = ? WHERE id = ?',
      [full_name, phone || null, gender || 'unspecified', theme_preference || 'light', id]
    );
    return this.findById(id);
  }

  static async updatePassword(id, hashedPassword) {
    await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
    return true;
  }

  static async updateAvatar(id, avatarUrl) {
    await db.execute('UPDATE users SET avatar_url = ? WHERE id = ?', [avatarUrl, id]);
    return this.findById(id);
  }
}

export default User;
