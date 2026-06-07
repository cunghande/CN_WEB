import db from '../config/db.js';

class User {
  static async findByEmail(email) {
    const [rows] = await db.execute('SELECT * FROM users WHERE email = ? AND deleted_at IS NULL', [email]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.execute(
      `SELECT id, full_name, email, role, COALESCE(status, 'active') AS status,
        avatar_url, phone, gender, theme_preference, last_login_at, created_at
       FROM users
       WHERE id = ? AND deleted_at IS NULL`,
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
    const [rows] = await db.execute(`
      SELECT
        u.id, u.full_name, u.email, u.role, COALESCE(u.status, 'active') AS status,
        u.avatar_url, u.phone, u.gender, u.theme_preference, u.last_login_at, u.created_at,
        COUNT(o.id) AS order_count,
        COALESCE(SUM(CASE WHEN o.status <> 'cancelled' THEN o.total_amount ELSE 0 END), 0) AS total_spent
      FROM users u
      LEFT JOIN orders o ON o.user_id = u.id
      WHERE u.deleted_at IS NULL
      GROUP BY u.id
      ORDER BY u.id DESC
    `);
    return rows;
  }

  static async findAdminDetailById(id) {
    const user = await this.findById(id);
    if (!user) return null;

    const [summaryRows] = await db.execute(
      `SELECT
        COUNT(*) AS order_count,
        COALESCE(SUM(CASE WHEN status <> 'cancelled' THEN total_amount ELSE 0 END), 0) AS total_spent,
        COALESCE(SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END), 0) AS delivered_count,
        COALESCE(SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END), 0) AS cancelled_count
       FROM orders
       WHERE user_id = ?`,
      [id]
    );

    const [orders] = await db.execute(
      `SELECT id, status, subtotal_amount, shipping_fee, discount_amount, shipping_discount_amount,
        total_amount, order_date AS created_at, receiver_name, receiver_phone
       FROM orders
       WHERE user_id = ?
       ORDER BY id DESC
       LIMIT 12`,
      [id]
    );

    const [addresses] = await db.execute(
      `SELECT id, receiver_name, receiver_phone, province_name, district_name, ward_name,
        hamlet, address_line, is_default, created_at
       FROM user_addresses
       WHERE user_id = ?
       ORDER BY is_default DESC, id DESC`,
      [id]
    );

    const [comments] = await db.execute(
      `SELECT pc.id, pc.product_id, pc.content, pc.created_at, p.name AS product_name
       FROM product_comments pc
       JOIN products p ON p.id = pc.product_id
       WHERE pc.user_id = ?
       ORDER BY pc.id DESC
       LIMIT 10`,
      [id]
    );

    return {
      ...user,
      summary: summaryRows[0] || { order_count: 0, total_spent: 0, delivered_count: 0, cancelled_count: 0 },
      orders,
      addresses,
      comments
    };
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

  static async updateRole(id, role) {
    await db.execute('UPDATE users SET role = ? WHERE id = ? AND deleted_at IS NULL', [role, id]);
    return this.findById(id);
  }

  static async updateStatus(id, status) {
    await db.execute('UPDATE users SET status = ? WHERE id = ? AND deleted_at IS NULL', [status, id]);
    return this.findById(id);
  }

  static async markLogin(id) {
    await db.execute('UPDATE users SET last_login_at = NOW() WHERE id = ?', [id]);
    return true;
  }

  static async setPasswordResetToken(id, tokenHash, expiresAt, otpHash = null) {
    await db.execute(
      `UPDATE users
       SET reset_password_token_hash = ?,
           reset_password_otp_hash = ?,
           reset_password_expires_at = ?,
           reset_password_requested_at = NOW()
       WHERE id = ?`,
      [tokenHash, otpHash, expiresAt, id]
    );
    return true;
  }

  static async findByPasswordResetToken(email, tokenHash) {
    const [rows] = await db.execute(
      `SELECT *
       FROM users
       WHERE email = ?
         AND reset_password_token_hash = ?
         AND reset_password_expires_at > NOW()
       LIMIT 1`,
      [email, tokenHash]
    );
    return rows[0];
  }

  static async findByPasswordResetOtp(email, otpHash) {
    const [rows] = await db.execute(
      `SELECT *
       FROM users
       WHERE email = ?
         AND reset_password_otp_hash = ?
         AND reset_password_expires_at > NOW()
       LIMIT 1`,
      [email, otpHash]
    );
    return rows[0];
  }

  static async clearPasswordResetToken(id) {
    await db.execute(
      `UPDATE users
       SET reset_password_token_hash = NULL,
           reset_password_otp_hash = NULL,
           reset_password_expires_at = NULL,
           reset_password_requested_at = NULL
       WHERE id = ?`,
      [id]
    );
    return true;
  }

  static async updateAvatar(id, avatarUrl) {
    await db.execute('UPDATE users SET avatar_url = ? WHERE id = ?', [avatarUrl, id]);
    return this.findById(id);
  }

  static async findOrCreateSocialUser(profile) {
    const existing = await this.findByEmail(profile.email);
    if (existing) {
      if (profile.avatar_url && !existing.avatar_url) {
        await db.execute('UPDATE users SET avatar_url = ? WHERE id = ?', [profile.avatar_url, existing.id]);
      }
      return this.findById(existing.id);
    }

    const [result] = await db.execute(
      'INSERT INTO users (full_name, email, password, role, avatar_url, theme_preference) VALUES (?, ?, ?, ?, ?, ?)',
      [profile.full_name, profile.email, profile.password, 'customer', profile.avatar_url || '', 'light']
    );
    return this.findById(result.insertId);
  }
}

export default User;
