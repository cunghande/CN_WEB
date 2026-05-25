import db from '../config/db.js';

class UserAddress {
  static async findByUserId(userId) {
    const [rows] = await db.execute(
      'SELECT * FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC',
      [userId]
    );
    return rows;
  }

  static async findByIdForUser(id, userId) {
    const [rows] = await db.execute(
      'SELECT * FROM user_addresses WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return rows[0];
  }

  static async create(userId, data) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      if (data.is_default) {
        await connection.execute('UPDATE user_addresses SET is_default = FALSE WHERE user_id = ?', [userId]);
      }

      const [result] = await connection.execute(
        `INSERT INTO user_addresses
        (user_id, receiver_name, receiver_phone, province_code, province_name, district_code, district_name, ward_code, ward_name, hamlet, address_line, is_default)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          data.receiver_name,
          data.receiver_phone,
          data.province_code,
          data.province_name,
          data.district_code,
          data.district_name,
          data.ward_code,
          data.ward_name,
          data.hamlet || '',
          data.address_line,
          Boolean(data.is_default)
        ]
      );

      await connection.commit();
      return result.insertId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async update(id, userId, data) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      if (data.is_default) {
        await connection.execute('UPDATE user_addresses SET is_default = FALSE WHERE user_id = ?', [userId]);
      }

      await connection.execute(
        `UPDATE user_addresses SET
          receiver_name = ?, receiver_phone = ?, province_code = ?, province_name = ?,
          district_code = ?, district_name = ?, ward_code = ?, ward_name = ?,
          hamlet = ?, address_line = ?, is_default = ?
        WHERE id = ? AND user_id = ?`,
        [
          data.receiver_name,
          data.receiver_phone,
          data.province_code,
          data.province_name,
          data.district_code,
          data.district_name,
          data.ward_code,
          data.ward_name,
          data.hamlet || '',
          data.address_line,
          Boolean(data.is_default),
          id,
          userId
        ]
      );

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async delete(id, userId) {
    await db.execute('DELETE FROM user_addresses WHERE id = ? AND user_id = ?', [id, userId]);
    return true;
  }
}

export default UserAddress;
