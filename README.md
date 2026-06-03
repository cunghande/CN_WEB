# LuxuryWear - Website thương mại điện tử bán quần áo

LuxuryWear là dự án e-commerce thời trang sử dụng React/Vite, Express và MySQL. Hệ thống mô phỏng các nghiệp vụ chính của một website bán hàng hiện đại: xem sản phẩm, biến thể size/màu/ảnh, giỏ hàng, đặt hàng COD, địa chỉ giao hàng, phí ship demo, voucher, thông báo, đánh giá sau mua, bình luận sản phẩm, quản trị đơn hàng, voucher và người dùng.

## Công nghệ

- Frontend: React, Vite, Redux Toolkit, Tailwind CSS, lucide-react.
- Backend: Node.js, Express, MySQL2, JWT, bcryptjs, multer, nodemailer.
- Database: MySQL, schema `shop_quan_ao`.
- Địa chỉ hành chính: Province Open API.
- Email: Gmail SMTP bằng App Password.
- OAuth: Google/Facebook qua backend OAuth redirect.

## Cài đặt local

```bash
npm install
npm run install:all
```

Tạo file `backend/.env` theo mẫu sau:

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

GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
```

Không commit `backend/.env` vì file này chứa mật khẩu MySQL, JWT secret, OAuth secret và SMTP App Password.

## Database

Migration được tách theo từng bảng trong `database/migrations/`. Mỗi file tạo một bảng rõ ràng, dễ đọc và dễ chạy lại từ đầu.

Chạy migration:

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
mysql -u root -p shop_quan_ao < database/migrations/020_add_user_admin_fields.sql
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

Chạy cả backend và frontend:

```bash
npm run dev
```

Chạy riêng từng phần:

```bash
npm run dev:backend
npm run dev:frontend
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000/api`

## Cấu trúc dự án

```text
backend/
  server.js                    # Khởi tạo Express, CORS, static uploads và gắn API routes
  src/config/                  # Kết nối MySQL, cấu hình JWT
  src/routes/                  # Khai báo endpoint REST
  src/controllers/             # Validate request, điều phối nghiệp vụ, trả response
  src/models/                  # Truy vấn MySQL
  src/services/                # Logic dùng lại: email, shipping, OAuth helper
  src/middleware/              # Auth, phân quyền, upload, error handler
  src/utils/                   # Helper validate, response, format
  uploads/                     # Ảnh upload local, không commit

frontend/src/
  routes/                      # React Router và PrivateRoute
  services/                    # Hàm gọi API bằng axios
  redux/                       # State auth, cart, products, notifications
  hooks/                       # Hook dùng lại
  pages/customer/              # Trang khách hàng
  pages/admin/                 # Trang quản trị
  components/                  # Component UI dùng chung
  utils/                       # Helper format tiền, ảnh, validate, sản phẩm

database/
  migrations/                  # Schema MySQL
  seeders/                     # Dữ liệu demo
```

## Luồng xử lý chính

### Đăng nhập

```text
HomePage.jsx
-> authService.loginAPI()
-> POST /api/auth/login
-> auth.routes.js
-> auth.controller.login()
-> User.model.findByEmail()
-> bảng users
```

Backend chuẩn hóa email, kiểm tra trạng thái tài khoản, so sánh mật khẩu bằng bcrypt, tạo JWT và trả về `user + token`. Frontend lưu token vào Redux/localStorage và axios tự gắn token vào các request cần đăng nhập.

### Xem sản phẩm

```text
ProductsPage.jsx
-> productService.getProductsAPI()
-> GET /api/products
-> product.routes.js
-> product.controller.getProducts()
-> Product.model.findAll()
-> products, product_variants, categories
```

Frontend hỗ trợ tìm kiếm, lọc danh mục, tag, trạng thái tồn kho và phân trang sản phẩm.

### Chi tiết sản phẩm

```text
ProductDetailPage.jsx
-> productService.getProductByIdAPI(id)
-> GET /api/products/:id
-> product.controller.getProductById()
-> Product.model.findById()
-> products, product_variants, comments, reviews, tags
```

Trang chi tiết cho phép chọn biến thể, đổi ảnh theo biến thể, xem rating/comment, phản hồi bình luận và đánh giá sau khi đã mua hàng thành công.

### Đặt hàng

```text
CartPage.jsx
-> orderService.createOrderAPI()
-> POST /api/orders
-> order.routes.js
-> authenticate
-> order.controller.createOrder()
-> shippingService.buildShippingQuote()
-> Coupon.model.validateMultiple()
-> Order.model.create()
-> orders, order_items, product_variants, notifications
```

Backend kiểm tra địa chỉ, tính phí ship, áp voucher, lưu snapshot người nhận, tạo đơn, trừ tồn kho, tạo thông báo và gửi email xác nhận.

### Đánh giá sau mua

```text
Navbar.jsx / OrdersPage.jsx
-> ReviewRequestModal.jsx
-> productService.addProductReviewAPI()
-> POST /api/products/:id/reviews
-> product.controller.addReview()
-> Product.model.addReview()
-> product_reviews
```

Khi admin đổi đơn sang `delivered`, backend tạo thông báo yêu cầu đánh giá cho từng sản phẩm trong đơn. User click thông báo để mở form đánh giá, nhập sao, nội dung và ảnh phản hồi.

### Voucher

```text
VoucherEventPage.jsx / CartPage.jsx / ManageCoupons.jsx
-> couponService
-> /api/coupons/*
-> coupon.routes.js
-> coupon.controller
-> Coupon.model
-> coupons, coupon_redemptions, user_coupons
```

Voucher hỗ trợ giảm phần trăm đơn hàng, freeship, giảm phí ship, giới hạn thời gian, số lượng, mỗi user và nhiệm vụ săn voucher.

### Quản lý người dùng

```text
ManageUsers.jsx
-> authService.getUsersAPI()
-> GET /api/auth/users
-> auth.routes.js
-> authorizeAdmin
-> user.controller.getUsers()
-> User.model.findAll()
-> users, orders
```

Admin xem danh sách user, lọc theo vai trò/trạng thái, xem chi tiết lịch sử mua hàng, địa chỉ, bình luận, khóa/mở khóa tài khoản, cấp/hạ quyền admin và gửi email reset mật khẩu.

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

## Kiểm tra trước commit

```bash
npm run build --prefix frontend
node --check backend/server.js
```

Có thể kiểm tra toàn bộ file backend:

```bash
Get-ChildItem backend/src -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }
```

## Ghi chú public website

Khi đưa website lên public cần chuẩn bị:

- Một MySQL database online.
- Một nơi chạy backend Node.js.
- Một nơi chạy frontend Vite.
- Biến môi trường production cho database, JWT, SMTP, OAuth và `VITE_API_URL`.
- OAuth callback production cho Google/Facebook.

Không commit thông tin thật như mật khẩu database, SMTP App Password, Google Client Secret hoặc Facebook App Secret.

## Tác giả

Tác giả: **Cung Do**

Email: `docung926@gmail.com`
