# Project Guide - Cấu Trúc Và Luồng Xử Lý

## Cấu Trúc Chính

```text
backend/
  server.js                    # Khởi tạo Express, cấu hình static uploads, gắn route API
  src/config/                  # Kết nối MySQL, JWT
  src/routes/                  # Khai báo endpoint REST
  src/controllers/             # Nhận request, validate, gọi model/service
  src/models/                  # Truy vấn MySQL
  src/services/                # Logic nghiệp vụ dùng lại: email, shipping
  src/middleware/              # Auth, phân quyền, upload
  uploads/                     # Ảnh upload từ admin/user

frontend/src/
  routes/                      # Route React và route bảo vệ
  services/                    # Gọi API bằng axios
  redux/                       # Auth, cart, product, notification state
  hooks/                       # Hook gom logic dùng lại
  pages/customer/              # Trang khách hàng
  pages/admin/                 # Trang quản trị
  components/                  # UI chung
  utils/                       # Format tiền, ảnh, helper sản phẩm

database/
  migrations/                  # Mỗi file tạo một bảng đầy đủ
  seeders/                     # Dữ liệu demo
```

## Quy Ước Luồng Backend

Luồng chuẩn của dự án:

```text
Page React -> service API -> Express route -> controller -> model/service -> MySQL
```

Ví dụ đăng nhập:

```text
HomePage.jsx
authService.loginAPI()
POST /api/auth/login
auth.routes.js
auth.controller.login
User.model.findByEmail
users table
```

Ví dụ đặt hàng:

```text
CartPage.jsx
orderService.createOrderAPI()
POST /api/orders
order.routes.js
authenticate middleware
order.controller.createOrder
shippingService.buildShippingQuote
Coupon.model.validateMultiple
Order.model.create
orders, order_items, product_variants, notifications
```

Ví dụ quên mật khẩu OTP:

```text
HomePage.jsx
authService.forgotPasswordAPI()
POST /api/auth/forgot-password
auth.routes.js
auth.controller.forgotPassword
User.model.setPasswordResetToken
emailService.sendPasswordResetOtpEmail
```

## Quy Ước Database

- Dựng database mới: chạy lần lượt các file trong `database/migrations/` theo thứ tự tên file, sau đó chạy seeders.
- `migrations/` chỉ chứa cấu trúc bảng, không chứa dữ liệu demo.
- Seed demo: chạy các file trong `database/seeders/`.

Mỗi bảng được tạo đầy đủ ngay trong file riêng của bảng đó, không có kiểu tạo bảng thiếu cột rồi file sau `ALTER TABLE` bổ sung.

## Tài Khoản Và Email

Quên mật khẩu chỉ gửi OTP cho email đã có trong bảng `users`. SMTP dùng Gmail App Password:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
SMTP_FROM="LuxuryWear <your-email@gmail.com>"
```

Backend tự bỏ khoảng trắng trong `SMTP_PASS`, nên có thể copy App Password từ Google theo nhóm 4 ký tự.
