import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Luôn đọc backend/.env dù chạy lệnh từ thư mục gốc hay từ thư mục backend.
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
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
