# LuxuryWear - Website thương mại điện tử bán quần áo

LuxuryWear là dự án e-commerce thời trang xây dựng bằng React/Vite, Express và MySQL. Hệ thống mô phỏng một website bán hàng hiện đại: xem sản phẩm, lọc danh mục, biến thể size/màu/ảnh, giỏ hàng, đặt hàng COD, địa chỉ giao hàng, phí ship demo, voucher, thông báo, đánh giá sau mua, bình luận sản phẩm, quản trị đơn hàng, sản phẩm, voucher và người dùng.

## Tính năng chính

### Khách hàng

- Trang chủ hiện đại, có carousel, danh mục nổi bật và sản phẩm mới.
- Trang sản phẩm có tìm kiếm, lọc giá, lọc tồn kho, lọc danh mục và phân trang hiện đại.
- Trang chi tiết sản phẩm có biến thể size/màu/ảnh, like, share, rating, bình luận và phản hồi.
- Giỏ hàng kiểm tra tồn kho, chọn địa chỉ nhận hàng, tính phí ship và áp dụng voucher.
- Ví voucher và trang săn voucher theo nhiệm vụ.
- Tài khoản cá nhân: hồ sơ, địa chỉ, bảo mật, lịch sử đơn hàng, thông báo.
- Quên mật khẩu bằng OTP email.
- Đăng nhập email/password, Google OAuth và Facebook OAuth.
- Chatbot AI tư vấn sản phẩm, voucher, chính sách và chọn đồ.

### Quản trị

- Dashboard KPI: doanh thu, đơn hàng, sản phẩm, khách hàng, tồn kho thấp.
- Quản lý sản phẩm: thêm/sửa/xóa, nhiều biến thể, ảnh theo biến thể, hashtag.
- Quản lý đơn hàng: xem chi tiết sản phẩm trong đơn, cập nhật trạng thái, gửi thông báo/email.
- Quản lý voucher: mã giảm giá, freeship, số lượng, thời gian, nhiệm vụ săn voucher.
- Quản lý người dùng: xem thông tin, lịch sử mua hàng, trạng thái tài khoản, phân quyền.
- Thông báo admin khi có đơn hàng, bình luận, phản hồi.

## Công nghệ

- Frontend: React 18, Vite, Redux Toolkit, Tailwind CSS, lucide-react, Axios.
- Backend: Node.js, Express, MySQL2, JWT, bcryptjs, multer, nodemailer.
- Database: MySQL, schema mặc định `shop_quan_ao`.
- AI: OpenRouter API, hỗ trợ nhiều model fallback.
- Địa chỉ hành chính: Province Open API.
- Email: SMTP, thường dùng Gmail App Password.

## Yêu cầu môi trường

- Node.js 20+ hoặc 22+.
- MySQL 8.x.
- npm.

## Cài đặt local

```bash
cd D:/CN_WEB
npm install
npm run install:all
```

Tạo file `backend/.env` từ `backend/.env.example` hoặc theo mẫu:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
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
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback

FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_REDIRECT_URI=http://localhost:5000/api/auth/facebook/callback

OPENROUTER_API_KEY=your-openrouter-api-key
OPENROUTER_MODELS=deepseek/deepseek-chat-v3:free,meta-llama/llama-3.3-70b-instruct:free
```

Không commit `backend/.env`. File này chứa mật khẩu MySQL, JWT secret, SMTP App Password, Google Client Secret, Facebook App Secret và OpenRouter API key.

## Database

Migration được tách theo từng bảng trong `database/migrations/`.

Chạy toàn bộ migration và seed cơ bản:

```bash
npm run db:setup --prefix backend
```

Seed hơn 1.000 sản phẩm demo:

```bash
npm run db:seed:large
```

Mặc định script tạo:

- 1.200 sản phẩm.
- 3.600 biến thể.
- 57 tag.
- Hàng nghìn bản ghi map tag sản phẩm.

Muốn seed số lượng khác:

```bash
npm run db:seed:large -- --count=2000
```

Lưu ý: `db:seed:large` reset sản phẩm, biến thể, tag và một số dữ liệu demo liên quan tới đơn hàng để tránh lỗi khóa ngoại và dữ liệu trùng.

## Chạy dự án

Chạy backend:

```bash
npm run dev:backend
```

Chạy frontend:

```bash
npm run dev:frontend
```

Hoặc chạy cùng lúc:

```bash
npm run dev
```

Địa chỉ mặc định:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- API root: `http://localhost:5000/api`

## Cấu trúc dự án

```text
D:/CN_WEB
├─ backend/
├─ frontend/
├─ database/
├─ package.json
├─ package-lock.json
└─ README.md
```

### Root

```text
package.json
package-lock.json
```

- `install:all`: cài dependency backend và frontend.
- `dev:backend`: chạy Express backend.
- `dev:frontend`: chạy Vite frontend.
- `dev`: chạy backend và frontend bằng `concurrently`.
- `db:seed:large`: seed dữ liệu sản phẩm lớn.

### Backend

```text
backend/
├─ server.js
├─ package.json
├─ scripts/
├─ src/
└─ uploads/
```

- `server.js`: khởi tạo Express, CORS, static uploads, health check và mount API routes.
- `scripts/run-database-files.js`: chạy migration/seed SQL.
- `scripts/seed-large-products.js`: tạo dữ liệu demo lớn cho sản phẩm, biến thể và tag.
- `uploads/`: lưu ảnh upload local như avatar, ảnh sản phẩm, ảnh review.

```text
backend/src/
├─ config/
├─ controllers/
├─ middleware/
├─ models/
├─ routes/
├─ services/
└─ utils/
```

- `config/db.js`: cấu hình kết nối MySQL.
- `config/jwt.js`: cấu hình JWT.
- `routes/`: khai báo endpoint REST.
- `controllers/`: nhận request, validate dữ liệu, điều phối nghiệp vụ.
- `models/`: truy vấn MySQL.
- `services/`: logic dùng lại như email, shipping, OpenRouter, AI retrieval.
- `middleware/`: auth, phân quyền, upload, error handler.
- `utils/`: helper response và validation.

### Frontend

```text
frontend/src/
├─ components/
├─ hooks/
├─ pages/
├─ redux/
├─ routes/
├─ services/
└─ utils/
```

- `components/`: component dùng chung như Navbar, Sidebar, Modal, Button, AI chat widget.
- `hooks/`: hook lấy dữ liệu sản phẩm, danh mục, đơn hàng.
- `pages/customer/`: trang khách hàng.
- `pages/admin/`: trang quản trị.
- `redux/`: state auth, cart, product, notification, theme.
- `routes/`: React Router và route guard.
- `services/`: hàm gọi API backend bằng Axios.
- `utils/`: format tiền, xử lý ảnh, validate form.

### Database

```text
database/
├─ migrations/
└─ seeders/
```

- `migrations/`: schema MySQL, tách từng bảng.
- `seeders/`: dữ liệu demo cơ bản.

## Luồng xử lý chính

### Đăng nhập

```text
HomePage.jsx / Navbar.jsx
-> authService.loginAPI()
-> POST /api/auth/login
-> auth.routes.js
-> auth.controller.login()
-> User.model.findByEmail()
-> bảng users
```

Backend chuẩn hóa email, kiểm tra trạng thái tài khoản, so sánh mật khẩu bằng bcrypt, tạo JWT và trả về `user + token`. Frontend lưu token vào Redux/localStorage và Axios tự gắn token vào request cần đăng nhập.

### Xem danh sách sản phẩm

```text
ProductsPage.jsx
-> productService.getProductsAPI()
-> GET /api/products
-> product.routes.js
-> product.controller.getProducts()
-> Product.model.findAll()
-> products, product_variants, categories, product_tags
```

Frontend xử lý tìm kiếm, lọc giá, lọc tồn kho, lọc danh mục, sắp xếp và phân trang. Với dữ liệu lớn, mỗi trang đang hiển thị 9 sản phẩm.

### Xem chi tiết sản phẩm

```text
ProductDetailPage.jsx
-> productService.getProductByIdAPI(id)
-> GET /api/products/:id
-> product.routes.js
-> product.controller.getProductById()
-> Product.model.findById()
-> products, product_variants, comments, replies, reviews, tags
```

Trang chi tiết cho phép chọn biến thể, đổi ảnh theo biến thể, like sản phẩm, xem đánh giá, bình luận và phản hồi.

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

Backend kiểm tra địa chỉ, tính phí ship, áp voucher, lưu snapshot người nhận, tạo đơn hàng, trừ tồn kho, tạo thông báo và gửi email xác nhận nếu SMTP được cấu hình.

### Admin cập nhật trạng thái đơn

```text
ManageOrders.jsx
-> orderService.updateOrderStatusAPI()
-> PUT /api/orders/:id/status
-> order.routes.js
-> authenticate + authorizeAdmin
-> order.controller.updateOrderStatus()
-> Order.model.updateStatus()
-> orders, notifications
```

Khi đơn chuyển sang hoàn thành/giao thành công, hệ thống tạo thông báo cho user. Với mỗi sản phẩm trong đơn, user có thể được dẫn tới form đánh giá sản phẩm.

### Đánh giá và bình luận sau mua

```text
ProductDetailPage.jsx / ReviewRequestModal.jsx
-> productService.addProductReviewAPI()
-> POST /api/products/:id/reviews
-> product.routes.js
-> product.controller.addReview()
-> Product.model.addReview()
-> product_reviews
```

Chỉ user đã mua sản phẩm và đơn ở trạng thái giao thành công mới được đánh giá. Bình luận và phản hồi có like/dislike, thông báo cho chủ bình luận và admin.

### Voucher

```text
VoucherEventPage.jsx / CartPage.jsx / ManageCoupons.jsx
-> couponService
-> /api/coupons/*
-> coupon.routes.js
-> coupon.controller.js
-> Coupon.model.js
-> coupons, coupon_redemptions, user_coupons
```

Voucher hỗ trợ giảm phần trăm đơn hàng, freeship, giảm phí ship, giới hạn thời gian, giới hạn số lượng, ví voucher và nhiệm vụ săn voucher.

### Chatbot AI

```text
AiChatWidget.jsx
-> aiService.chatWithStylistAPI()
-> POST /api/ai/stylist
-> ai.routes.js
-> ai.controller.chatWithStylist()
-> aiRetrievalService.retrieveAiContext()
-> openRouterService.generateWithOpenRouterFallback()
```

Chatbot hiện áp dụng:

- RAG: lấy sản phẩm, voucher, policy từ dữ liệu thật.
- Function/tool calling nội bộ: `retrieve_products`, `retrieve_coupons`, `retrieve_policies`.
- Memory: đọc lịch sử chat gần nhất để hiểu câu hỏi nối tiếp.
- Hybrid search: keyword + synonym semantic nhẹ.
- Agent planning: tạo kế hoạch nhỏ trước khi trả lời.
- Model fallback: thử nhiều model OpenRouter, nếu lỗi/quota thì dùng fallback local.

## API chính

```text
GET    /api/products
GET    /api/products/:id
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id

GET    /api/categories

POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
PUT    /api/auth/profile
PUT    /api/auth/password
POST   /api/auth/forgot-password
POST   /api/auth/reset-password

GET    /api/orders
POST   /api/orders
PUT    /api/orders/:id/status

GET    /api/coupons
POST   /api/coupons/apply
POST   /api/coupons/claim

GET    /api/notifications
PUT    /api/notifications/:id/read

GET    /api/user/addresses
POST   /api/user/addresses
PUT    /api/user/addresses/:id
DELETE /api/user/addresses/:id

GET    /api/locations/provinces
GET    /api/locations/districts
GET    /api/locations/wards

POST   /api/shipping/quote
POST   /api/ai/stylist
```

## Kiểm tra trước khi commit

```bash
npm run build --prefix frontend
node --check backend/server.js
node --check backend/src/controllers/ai.controller.js
node --check backend/src/services/aiRetrievalService.js
node --check backend/scripts/seed-large-products.js
```

Có thể kiểm tra toàn bộ backend:

```powershell
Get-ChildItem backend/src -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }
```

## Ghi chú bảo mật

Không commit:

- `backend/.env`
- mật khẩu database
- JWT secret
- SMTP App Password
- Google Client Secret
- Facebook App Secret
- OpenRouter API key
- file upload riêng tư

Nếu từng lộ secret, hãy thu hồi và tạo secret mới trên dashboard của nhà cung cấp.

## Gợi ý chạy demo

```bash
npm run install:all
npm run db:setup --prefix backend
npm run db:seed:large
npm run dev:backend
npm run dev:frontend
```

Sau đó mở:

```text
http://localhost:3000
```

## Tác giả

Tác giả: **Cung Do**

Email: `docung926@gmail.com`
