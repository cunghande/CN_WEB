# 🚀 HƯỚNG DẪN HOẠT ĐỘNG DỰ ÁN BTL_WebCN

## 📋 MỤC LỤC
1. [Kiến trúc chung](#kiến-trúc-chung)
2. [Luồng dữ liệu](#luồng-dữ-liệu)
3. [Chi tiết từng phần](#chi-tiết-từng-phần)
4. [Ví dụ thực tế](#ví-dụ-thực-tế)

---

## 🏗️ KIẾN TRÚC CHUNG

```
┌─────────────────────────────────────────────────────────────┐
│                     PHÍA NGƯỜI DÙNG (FRONTEND)               │
│                    React + Vite + Axios                      │
│  (index.html → main.jsx → App.jsx → HomePage.jsx)           │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │   Gửi Request  │  Nhận Response │
        │   (HTTP/HTTPS) │   (JSON)       │
        │                │                │
        ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│              API SERVER (Backend - NodeJS Express)           │
│                  PORT: 5000                                  │
│  (server.js → routes → controllers → models/database)       │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │   Query        │   Insert/      │
        │   Select       │   Update/      │
        │   Commands     │   Delete       │
        ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE (MySQL)                          │
│              shop_quan_ao (Database Name)                    │
│  (products table, orders table, users table,...)             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 LUỒNG DỮ LIỆU HOÀN CHỈNH

### Ví dụ: Lấy danh sách sản phẩm

```
BƯỚC 1: Người dùng mở trang HomePage
┌─────────────────────────────────────┐
│ Browser → http://localhost:3000     │
│ React khởi động component HomePage  │
└─────────────────────────────────────┘

BƯỚC 2: HomePage gọi API lấy dữ liệu
┌─────────────────────────────────────┐
│ useEffect() chạy khi component mount│
│ Gọi: axiosClient.get('/products')   │
└─────────────────────────────────────┘

BƯỚC 3: Axios gửi HTTP Request tới Backend
┌─────────────────────────────────────┐
│ GET http://localhost:5000/api/products
│ Headers: Content-Type: application/json
│ Interceptor: Tự động thêm token nếu có
└─────────────────────────────────────┘

BƯỚC 4: Backend nhận request
┌─────────────────────────────────────┐
│ server.js khởi động → CORS allowed  │
│ Route '/api/products' được định tuyến
│ Gọi: router.get('/', controller)    │
└─────────────────────────────────────┘

BƯỚC 5: Controller xử lý logic
┌─────────────────────────────────────┐
│ productController.getAllProducts()   │
│ Tạo Query: SELECT * FROM products    │
│ Gửi truy vấn tới Database           │
└─────────────────────────────────────┘

BƯỚC 6: Database trả về kết quả
┌─────────────────────────────────────┐
│ MySQL tìm tất cả sản phẩm            │
│ Trả về mảng dữ liệu JSON             │
│ [                                    │
│   {id: 1, name: "Áo thun", ...},    │
│   {id: 2, name: "Quần jean", ...},  │
│ ]                                    │
└─────────────────────────────────────┘

BƯỚC 7: Backend gửi Response trở lại Frontend
┌─────────────────────────────────────┐
│ res.status(200).json(rows)           │
│ Trạng thái: 200 OK                   │
│ Dữ liệu: mảng sản phẩm               │
└─────────────────────────────────────┘

BƯỚC 8: Frontend nhận dữ liệu
┌─────────────────────────────────────┐
│ Axios interceptor kiểm tra status   │
│ Nếu 401 → Xóa token, đổi sang login │
│ Nếu 200 → Nhận dữ liệu              │
└─────────────────────────────────────┘

BƯỚC 9: React cập nhật State
┌─────────────────────────────────────┐
│ setProducts(response.data)           │
│ State thay đổi → Component render lại│
└─────────────────────────────────────┘

BƯỚC 10: Hiển thị trên màn hình
┌─────────────────────────────────────┐
│ products.map((product) => (         │
│   <div>                             │
│     <h3>{product.name}</h3>         │
│     <p>{product.price}</p>          │
│   </div>                            │
│ ))                                  │
│                                     │
│ ✓ Người dùng thấy danh sách sản phẩm│
└─────────────────────────────────────┘
```

---

## 📦 CHI TIẾT TỪNG PHẦN

### 1️⃣ PHÍA FRONTEND (React + Vite)

#### **File: src/main.jsx**
```javascript
// Điểm khởi động của ứng dụng React
ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
);
```

#### **File: src/App.jsx**
```javascript
// Component chính - hiển thị HomePage
function App() {
  return <HomePage />;
}
```

#### **File: src/pages/HomePage.jsx**
```javascript
// Cái gì xảy ra:
const HomePage = () => {
  const [products, setProducts] = useState([]);      // 1. Khởi tạo state rỗng
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 2. Khi component mount → gọi hàm này
    const fetchProducts = async () => {
      try {
        // 3. Gửi GET request tới API
        const response = await axiosClient.get("/products");
        
        // 4. Nhận dữ liệu trở lại
        setProducts(response.data);  // 5. Cập nhật state
        setLoading(false);
      } catch (error) {
        console.error("Lỗi:", error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // 6. Render dữ liệu lên màn hình
  return (
    <div>
      {loading ? <p>Đang tải...</p> : (
        products.map(product => (
          <div key={product.id}>
            <h3>{product.name}</h3>
            <p>{product.price}</p>
          </div>
        ))
      )}
    </div>
  );
};
```

#### **File: src/api/axiosInstance.js**
```javascript
// Cấu hình HTTP client
const axiosClient = axios.create({
  baseURL: 'http://localhost:5000/api',  // URL backend
  headers: { 'Content-Type': 'application/json' }
});

// Interceptor Request: Thêm token vào header
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor Response: Kiểm tra lỗi xác thực
axiosClient.interceptors.response.use(
  (response) => response,  // Nếu thành công → trả về
  (error) => {
    if (error.response?.status === 401) {  // Không có quyền
      localStorage.removeItem('token');
      window.location.href = '/login';      // Chuyển tới trang login
    }
    return Promise.reject(error);
  }
);
```

---

### 2️⃣ PHÍA BACKEND (Express + NodeJS)

#### **File: backend/server.js**
```javascript
// Khởi động server
const express = require('express');
const app = express();

// Middleware
app.use(cors());                           // Cho phép request từ frontend
app.use(express.json());                   // Parse JSON body
app.use(express.urlencoded({...}));        // Parse form data
app.use('/uploads', express.static(...));  // Phục vụ file static

// Routes (định tuyến)
app.use('/api/products', productRoutes);   // Tất cả request /api/products
app.use('/api/orders', orderRoutes);       // Tất cả request /api/orders

// Lắng nghe cổng 5000
app.listen(5000, () => console.log('Server chạy trên port 5000'));
```

#### **File: backend/routes/productRoutes.js**
```javascript
// Định tuyến (routing)
const router = express.Router();
const productController = require('../controllers/productController');

// Khi nhận GET /api/products → gọi getAllProducts
router.get('/', productController.getAllProducts);

// Khi nhận GET /api/products/1 → gọi getProductById
router.get('/:id', productController.getProductById);

// Khi nhận POST /api/products → gọi createProduct
router.post('/', productController.createProduct);

// Khi nhận PUT /api/products/1 → gọi updateProduct
router.put('/:id', productController.updateProduct);

// Khi nhận DELETE /api/products/1 → gọi deleteProduct
router.delete('/:id', productController.deleteProduct);

module.exports = router;
```

#### **File: backend/controllers/productController.js**
```javascript
// Xử lý logic và truy vấn database
const db = require('../config/db');

// Lấy tất cả sản phẩm
exports.getAllProducts = async (req, res) => {
  try {
    // 1. Viết query SQL
    const [rows] = await db.query("SELECT * FROM products");
    
    // 2. Gửi dữ liệu trở lại client
    res.status(200).json(rows);
  } catch (error) {
    // 3. Nếu lỗi → gửi message lỗi
    res.status(500).json({ message: error.message });
  }
};

// Lấy 1 sản phẩm theo ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;  // Lấy ID từ URL: /api/products/5
    const [rows] = await db.query(
      "SELECT * FROM products WHERE id = ?", 
      [id]  // Tránh SQL injection
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tạo sản phẩm mới
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, image, category } = req.body;
    const [result] = await db.query(
      "INSERT INTO products (name, description, price, image, category) VALUES (?, ?, ?, ?, ?)",
      [name, description, price, image, category]
    );
    res.status(201).json({ 
      id: result.insertId,  // ID của record vừa tạo
      name, description, price, image, category 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật sản phẩm
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, image, category } = req.body;
    await db.query(
      "UPDATE products SET name = ?, description = ?, price = ?, image = ?, category = ? WHERE id = ?",
      [name, description, price, image, category, id]
    );
    res.status(200).json({ message: 'Product updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa sản phẩm
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM products WHERE id = ?", [id]);
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

#### **File: backend/config/db.js**
```javascript
// Cấu hình kết nối Database
const mysql = require('mysql2');
require('dotenv').config();  // Đọc file .env

const pool = mysql.createPool({
  host: process.env.DB_HOST,           // localhost
  user: process.env.DB_USER,           // root
  password: process.env.DB_PASSWORD,   // cunghande
  database: process.env.DB_NAME,       // shop_quan_ao
  waitForConnections: true,
  connectionLimit: 10  // Tối đa 10 connection đồng thời
});

// Export để dùng ở controller
module.exports = pool.promise();
```

---

### 3️⃣ DATABASE (MySQL)

#### **Bảng: products**
```sql
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  image VARCHAR(255),
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Thêm dữ liệu mẫu
INSERT INTO products VALUES
(1, 'Áo thun nam', 'Áo thun cotton 100%', 150000, 'ao-thun.jpg', 'áo'),
(2, 'Quần jean xanh', 'Quần jean co giãn', 350000, 'quan-jean.jpg', 'quần');
```

---

## 💡 VÍ DỤ THỰC TẾ

### Tình huống: Hiển thị danh sách sản phẩm

**BƯỚC 1: Code Frontend**
```javascript
// src/pages/HomePage.jsx
useEffect(() => {
  axiosClient.get("/products")  // ← Gửi request
    .then(res => setProducts(res.data))  // ← Nhận dữ liệu
    .catch(err => console.error(err));
}, []);

return (
  <div>
    {products.map(p => (
      <div key={p.id}>
        <h3>{p.name}</h3>
        <p>{p.price} VNĐ</p>
      </div>
    ))}
  </div>
);
```

**BƯỚC 2: Network Request**
```
URL:     GET http://localhost:5000/api/products
Status:  200 OK
Body:    [
           {id: 1, name: "Áo thun nam", price: 150000, ...},
           {id: 2, name: "Quần jean xanh", price: 350000, ...}
         ]
```

**BƯỚC 3: Kết quả trên màn hình**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📦 Áo thun nam                  150.000 VNĐ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📦 Quần jean xanh              350.000 VNĐ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🔐 Xác thực & Middleware

### File: backend/middleware/authMiddleware.js
```javascript
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // 1. Lấy token từ header
  const token = req.headers.authorization?.split(' ')[1];
  
  // 2. Kiểm tra token có tồn tại không
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    // 3. Xác minh token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 4. Lưu thông tin user vào request
    req.user = decoded;
    
    // 5. Tiếp tục xử lý
    next();
  } catch (error) {
    // 6. Token không hợp lệ
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;
```

**Cách sử dụng:**
```javascript
// Bảo vệ route
router.put('/:id', authMiddleware, productController.updateProduct);
// ↑ Chỉ người dùng đã login mới có thể update
```

---

## 📤 Upload Hình ảnh

### File: backend/middleware/uploadMiddleware.js
```javascript
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Lưu vào thư mục uploads
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);  // Tên file
  }
});

const upload = multer({ storage });

// Sử dụng
router.post('/upload', upload.single('image'), (req, res) => {
  res.json({ 
    path: req.file.path,
    filename: req.file.filename 
  });
});
```

---

## 🚀 CHẠY DỰ ÁN

### Terminal 1: Backend
```bash
cd backend
npm install          # Cài dependencies
npm run dev          # Chạy server (port 5000)
```

### Terminal 2: Frontend
```bash
cd frontend
npm install          # Cài dependencies
npm run dev          # Chạy app (port 3000)
```

### Kết quả
```
✓ Frontend: http://localhost:3000
✓ Backend:  http://localhost:5000/api
✓ Database: MySQL (localhost:3306)
```

---

## 📊 Luồng dữ liệu (Biểu đồ)

```
┌──────────────────────────────────────────────────────────┐
│                  REACT COMPONENT                          │
│  HomePage.jsx → useEffect → axiosClient.get()           │
└────────────────────────┬─────────────────────────────────┘
                         │ HTTP GET
                         ▼
┌──────────────────────────────────────────────────────────┐
│                   AXIOS INTERCEPTOR                       │
│  Thêm Token → Kiểm tra Status Code → Trả về Response    │
└────────────────────────┬─────────────────────────────────┘
                         │ HTTP Request
                         ▼
┌──────────────────────────────────────────────────────────┐
│                  EXPRESS SERVER                           │
│  server.js → CORS → Router → Controller                 │
└────────────────────────┬─────────────────────────────────┘
                         │ SQL Query
                         ▼
┌──────────────────────────────────────────────────────────┐
│                   MYSQL DATABASE                          │
│  SELECT * FROM products                                  │
└────────────────────────┬─────────────────────────────────┘
                         │ Dữ liệu JSON
                         ▼
┌──────────────────────────────────────────────────────────┐
│              REACT STATE (setProducts)                    │
│  Component re-render → Hiển thị danh sách                │
└────────────────────────┬─────────────────────────────────┘
                         │ JSX Render
                         ▼
┌──────────────────────────────────────────────────────────┐
│              TRÌNH DUYỆT (Browser)                        │
│  ✓ Hiển thị sản phẩm cho người dùng                      │
└──────────────────────────────────────────────────────────┘
```

---

## 🎯 Tóm tắt

| Phần | Công dụng | Port | Ngôn ngữ |
|------|-----------|------|---------|
| Frontend | Hiển thị UI, gửi request | 3000 | React/JavaScript |
| Backend | Xử lý logic, trả API | 5000 | NodeJS/Express |
| Database | Lưu trữ dữ liệu | 3306 | MySQL |

**Dòng chảy:**
1. User tương tác với Frontend
2. Frontend gửi HTTP request đến Backend
3. Backend xử lý, truy vấn Database
4. Database trả về dữ liệu
5. Backend gửi JSON response tới Frontend
6. Frontend cập nhật UI dựa trên dữ liệu

---

## ❓ Câu hỏi thường gặp

### Q: Tại sao phải dùng Interceptor?
**A:** Để tự động thêm token vào mỗi request, kiểm tra lỗi 401, redirect tới login.

### Q: Middleware có tác dụng gì?
**A:** Kiểm tra quyền, validate dữ liệu, xử lý file trước khi đến controller.

### Q: Async/await là gì?
**A:** Cách viết mã bất đồng bộ sao cho trông đồng bộ - chờ kết quả từ database.

### Q: Promise.reject() dùng để gì?
**A:** Ném lỗi để code bên trên có thể bắt bằng .catch() hoặc try/catch.

---

📝 **Tác giả:** BTL WebCN Team
📅 **Cập nhật:** 2024
💬 **Hỏi đáp:** Xem thêm trong README.md
