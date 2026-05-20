import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './src/routes/auth.routes.js';
import categoryRoutes from './src/routes/category.routes.js';
import orderRoutes from './src/routes/order.routes.js';
import productRoutes from './src/routes/product.routes.js';
import { errorHandler } from './src/middleware/errorHandler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload được lưu ở backend/uploads và được public qua /uploads.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API chính của hệ thống.
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Clothing Store Backend REST API đang hoạt động bình thường'
  });
});

// Middleware xử lý lỗi luôn đặt cuối cùng sau toàn bộ route.
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend đang chạy tại http://localhost:${PORT}`);
});
