# LUXURYWEAR - Website quản lý bán quần áo

LUXURYWEAR là dự án thương mại điện tử bán quần áo dùng React/Vite, Express và MySQL. Hệ thống có đầy đủ các luồng cơ bản của một website bán hàng: xem sản phẩm, chọn biến thể, giỏ hàng, đặt hàng COD, địa chỉ giao hàng, phí ship demo, voucher, thông báo, đánh giá sau mua, bình luận sản phẩm và trang quản trị.

## Công nghệ

- Frontend: React, Vite, Redux Toolkit, Tailwind CSS, lucide-react.
- Backend: Node.js, Express, MySQL2, JWT, bcryptjs, multer, nodemailer.
- Database: MySQL, schema `shop_quan_ao`.
- Địa chỉ hành chính: Province Open API.
- Email: Gmail SMTP bằng App Password.

## Cài đặt

```bash
npm install
npm run install:all
```

## Cấu hình môi trường

Tạo file `backend/.env` theo mẫu `backend/.env.example`.

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=shop_quan_ao
JWT_SECRET=change_this_secret
FRONTEND_URL=http://localhost:3000

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-google-app-password
SMTP_FROM="LuxuryWear <your-email@gmail.com>"
```

Lưu ý: không commit `backend/.env` vì có mật khẩu MySQL, OAuth secret và SMTP App Password.

## Database

`database/migrations/` được tách theo từng bảng. Mỗi file tạo một bảng đầy đủ cột ngay từ đầu, không có kiểu tạo bảng thiếu rồi file sau `ALTER TABLE` thêm cột.

Thứ tự chạy migration:

```bash
mysql -u root -p < database/migrations/000_create_database.sql
mysql -u root -p shop_quan_ao < database/migrations/001_create_users.sql
mysql -u root -p shop_quan_ao < database/migrations/002_create_categories.sql
mysql -u root -p shop_quan_ao < database/migrations/003_create_products.sql
mysql -u root -p shop_quan_ao < database/migrations/004_create_product_variants.sql
mysql -u root -p shop_quan_ao < database/migrations/005_create_user_addresses.sql
mysql -u root -p shop_quan_ao < database/migrations/006_create_orders.sql
mysql -u root -p shop_quan_ao < database/migrations/007_create_order_items.sql
mysql -u root -p shop_quan_ao < database/migrations/008_create_notifications.sql
mysql -u root -p shop_quan_ao < database/migrations/009_create_product_likes.sql
mysql -u root -p shop_quan_ao < database/migrations/010_create_product_comments.sql
mysql -u root -p shop_quan_ao < database/migrations/011_create_product_comment_reactions.sql
mysql -u root -p shop_quan_ao < database/migrations/012_create_product_comment_replies.sql
mysql -u root -p shop_quan_ao < database/migrations/013_create_product_comment_reply_reactions.sql
mysql -u root -p shop_quan_ao < database/migrations/014_create_product_reviews.sql
mysql -u root -p shop_quan_ao < database/migrations/015_create_product_tags.sql
mysql -u root -p shop_quan_ao < database/migrations/016_create_product_tag_map.sql
mysql -u root -p shop_quan_ao < database/migrations/017_create_coupons.sql
mysql -u root -p shop_quan_ao < database/migrations/018_create_coupon_redemptions.sql
mysql -u root -p shop_quan_ao < database/migrations/019_create_user_coupons.sql
```

Chạy dữ liệu demo:

```bash
mysql -u root -p shop_quan_ao < database/seeders/categories.sql
mysql -u root -p shop_quan_ao < database/seeders/products.sql
mysql -u root -p shop_quan_ao < database/seeders/users.sql
mysql -u root -p shop_quan_ao < database/seeders/coupons.sql
mysql -u root -p shop_quan_ao < database/seeders/social_demo.sql
```

## Chạy dự án

Chạy cả frontend và backend:

```bash
npm run dev
```

Chạy riêng từng phần:

```bash
npm run dev:backend
npm run dev:frontend
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

## Tài khoản demo

- Admin: `admin@gmail.com` / `123456`
- Khách hàng: `a@gmail.com` / `123456`

## Cấu trúc thư mục

```text
backend/
  server.js                    # Khởi tạo Express, gắn route API, public uploads
  src/config/                  # Kết nối MySQL, JWT
  src/routes/                  # Khai báo endpoint REST
  src/controllers/             # Validate request và điều phối nghiệp vụ
  src/models/                  # Truy vấn MySQL
  src/services/                # Logic dùng lại: email, shipping
  src/middleware/              # Auth, phân quyền, upload, error handler
  uploads/                     # Ảnh upload local

frontend/src/
  routes/                      # Route React và PrivateRoute
  services/                    # Gọi API bằng axios
  redux/                       # State auth, cart, products, notifications
  hooks/                       # Hook dùng lại
  pages/customer/              # Trang khách hàng
  pages/admin/                 # Trang quản trị
  components/                  # Component UI dùng chung
  utils/                       # Helper format tiền, ảnh, sản phẩm

database/
  migrations/                  # Mỗi file tạo một bảng
  seeders/                     # Dữ liệu demo
```

## Luồng nghiệp vụ chính

### Đăng nhập

```text
HomePage.jsx
-> authService.loginAPI()
-> POST /api/auth/login
-> auth.routes.js
-> auth.controller.login
-> User.model.findByEmail()
-> bảng users
```

Backend kiểm tra email, so sánh mật khẩu bằng bcrypt, tạo JWT và trả về `user + token`. Frontend lưu vào Redux/localStorage và tự gắn token vào các request sau.

### Quên mật khẩu OTP

```text
HomePage.jsx
-> authService.forgotPasswordAPI()
-> POST /api/auth/forgot-password
-> auth.controller.forgotPassword
-> User.model.setPasswordResetToken()
-> emailService.sendPasswordResetOtpEmail()
-> Gmail SMTP
```

Chỉ email đã đăng ký tài khoản mới nhận OTP. OTP được hash trong database, không trả về frontend và không in ra console.

### Xem sản phẩm

```text
ProductsPage.jsx
-> productService.getProductsAPI()
-> GET /api/products
-> product.routes.js
-> product.controller.getProducts
-> Product.model.findAll()
-> products, product_variants, categories
```

Frontend có tìm kiếm, lọc danh mục và phân trang sản phẩm.

### Chi tiết sản phẩm

```text
ProductDetailPage.jsx
-> productService.getProductByIdAPI(id)
-> GET /api/products/:id
-> product.controller.getProductById
-> Product.model.findById()
```

Trang chi tiết hiển thị thông tin sản phẩm, biến thể, tồn kho, rating, comment, reply và đánh giá sau mua.

### Giỏ hàng và đặt hàng

```text
CartPage.jsx
-> orderService.createOrderAPI()
-> POST /api/orders
-> order.routes.js
-> authenticate
-> order.controller.createOrder
-> shippingService.buildShippingQuote()
-> Coupon.model.validateMultiple()
-> Order.model.create()
-> orders, order_items, product_variants, notifications
```

Khi đặt hàng thành công, backend tạo đơn, trừ tồn kho, lưu snapshot địa chỉ, áp voucher, tạo thông báo và gửi email xác nhận.

### Voucher

```text
VoucherEventPage.jsx / CartPage.jsx
-> couponService
-> /api/coupons/*
-> coupon.routes.js
-> coupon.controller
-> Coupon.model
```

Voucher hỗ trợ giảm phần trăm, miễn phí ship, giảm phí ship, giới hạn thời gian, giới hạn số lượng và điều kiện nhiệm vụ.

### Thông báo

```text
Navbar.jsx / AccountPage.jsx
-> notificationService
-> GET /api/notifications
-> notification.controller
-> Notification.model
-> notifications
```

Thông báo dùng cho trạng thái đơn hàng, bình luận, phản hồi, like/dislike và sự kiện admin cần theo dõi.

### Admin quản lý đơn hàng

```text
ManageOrders.jsx
-> orderService.updateOrderStatusAPI()
-> PUT /api/orders/:id/status
-> order.controller.updateOrderStatus
-> Order.model.updateStatus()
-> Notification.model.create()
-> emailService.sendOrderStatusEmail()
```

Admin đổi trạng thái đơn hàng, user nhận thông báo và email.

## API chính

```text
/api/auth
/api/products
/api/categories
/api/orders
/api/coupons
/api/notifications
/api/user/addresses
/api/locations
/api/shipping
```

## Voucher demo

- `WELCOME10`: giảm 10% cho đơn từ 200.000đ.
- `SALE20`: giảm 20%, tối đa 120.000đ cho đơn từ 500.000đ.
- `FREESHIP`: miễn phí vận chuyển cho đơn từ 150.000đ.
- `SHIP50`: giảm 50% phí vận chuyển.
- `NEW30`: user mới giảm 30% cho đơn từ 500.000đ.
- `NEWFREESHIP`: user mới miễn phí vận chuyển.
- `BUY3SHIP`: mua 3 sản phẩm bất kỳ nhận freeship.
- `MILLION30`: đơn từ 1.000.000đ giảm 30%.
- `OVER400K20`: đơn từ 400.000đ giảm 20%.
- `OVER200K15`: đơn từ 200.000đ giảm 15%.
- `STYLE25`: combo từ 2 sản phẩm và 700.000đ giảm 25%.

## Kiểm tra trước commit

```bash
npm run build --prefix frontend
```

Backend có thể kiểm tra cú pháp bằng:

```bash
node --check backend/server.js
```

## Tác giả

Tác giả: **Cung Do**

Email: `docung926@gmail.com`
