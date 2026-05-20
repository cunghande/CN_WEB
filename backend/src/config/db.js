import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'shop_quan_ao',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

try {
  const connection = await pool.getConnection();
  console.log('Đã kết nối thành công tới cơ sở dữ liệu MySQL.');
  connection.release();
} catch (error) {
  console.error('Lỗi kết nối cơ sở dữ liệu MySQL:', error.message);
}

export default pool;
