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
