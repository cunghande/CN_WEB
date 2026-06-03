import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './src/routes/auth.routes.js';
import addressRoutes from './src/routes/address.routes.js';
import categoryRoutes from './src/routes/category.routes.js';
import couponRoutes from './src/routes/coupon.routes.js';
import locationRoutes from './src/routes/location.routes.js';
import notificationRoutes from './src/routes/notification.routes.js';
import orderRoutes from './src/routes/order.routes.js';
import productRoutes from './src/routes/product.routes.js';
import shippingRoutes from './src/routes/shipping.routes.js';
import { errorHandler } from './src/middleware/errorHandler.js';
import db from './src/config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload được lưu trong backend/uploads và public qua endpoint /uploads.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Các route REST chính của hệ thống.
app.use('/api/auth', authRoutes);
app.use('/api/user', addressRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Clothing Store Backend REST API đang hoạt động bình thường'
  });
});

app.get('/api/health', async (req, res, next) => {
  try {
    const [rows] = await db.execute('SELECT DATABASE() AS database_name, COUNT(*) AS product_count FROM products');
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không kết nối hoặc truy vấn được MySQL',
      debug: {
        code: error.code,
        sqlMessage: error.sqlMessage,
        errorMessage: error.message,
        hasMysqlPublicUrl: Boolean(process.env.MYSQL_PUBLIC_URL),
        hasMysqlUrl: Boolean(process.env.MYSQL_URL),
        hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
        dbHost: process.env.DB_HOST || process.env.MYSQLHOST || null,
        dbName: process.env.DB_NAME || process.env.MYSQLDATABASE || null,
        dbPort: process.env.DB_PORT || process.env.MYSQLPORT || null
      }
    });
  }
});

// Middleware xử lý lỗi đặt cuối cùng sau toàn bộ route.
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend đang chạy tại http://localhost:${PORT}`);
});
