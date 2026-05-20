# Project Guide - Cấu Trúc Và Luồng Xử Lý

## Cấu Trúc Chính

```text
backend/
  server.js                     # Khởi tạo Express, public uploads, gắn route API
  src/config/db.js              # Kết nối MySQL
  src/config/jwt.js             # Tạo/kiểm tra JWT
  src/routes/                   # Khai báo endpoint
  src/controllers/              # Nhận request, validate, gọi model
  src/models/                   # Truy vấn MySQL
  src/middleware/auth.js        # Xác thực token và quyền admin
  src/middleware/upload.js      # Upload ảnh bằng multer

frontend/src/
  routes/AppRouter.jsx          # Khai báo route React
  routes/PrivateRoute.jsx       # Chặn route admin nếu không đủ quyền
  services/                     # Gọi API bằng axios
  redux/                        # Auth, product, cart state
  hooks/                        # Hook gom logic dùng lại
  pages/customer/               # Trang khách hàng
  pages/admin/                  # Trang quản trị
  utils/                        # Format tiền, ảnh, helper nghiệp vụ

database/
  migrations/                   # Tạo bảng
  seeders/                      # Dữ liệu demo
```

## Luồng Đăng Nhập

Frontend `HomePage.jsx` gọi `loginAPI()` trong `frontend/src/services/authService.js`.

```text
POST /api/auth/login
```

Backend đi qua:

```text
routes/auth.routes.js -> controllers/auth.controller.js -> models/User.model.js
```

Nếu đúng mật khẩu, backend trả `user` và `token`. Frontend lưu vào Redux/localStorage trong `authSlice.js`. Các request sau tự gắn token tại `frontend/src/services/api.js`.

## Luồng Sản Phẩm

Trang `ProductsPage.jsx` dùng `useProduct()`. Hook này gọi Redux thunk `fetchProducts()`.

```text
GET /api/products
GET /api/products?category=1
```

Backend xử lý:

```text
routes/product.routes.js -> controllers/product.controller.js -> models/Product.model.js
```

Model lấy sản phẩm, join danh mục và gộp danh sách biến thể `product_variants`.

## Luồng Giỏ Hàng

Người dùng chọn sản phẩm, size, màu trong quick view. `useCart.js` lưu sản phẩm theo `variant_id` vì cùng một sản phẩm có nhiều biến thể. State giỏ hàng nằm trong `redux/slices/cartSlice.js` và được lưu vào `localStorage`.

## Luồng Đặt Hàng

Trang `CartPage.jsx` gọi:

```text
POST /api/orders
```

Payload:

```json
{
  "items": [{ "variant_id": 1, "quantity": 2, "unit_price": 189000 }],
  "total_amount": 378000
}
```

Backend đi qua `authenticate`, sau đó `Order.model.js` tạo `orders`, `order_items` và trừ tồn kho trong cùng transaction.

## Luồng Admin Sản Phẩm

Trang:

```text
frontend/src/pages/admin/ManageProducts.jsx
```

API:

```text
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
```

Các route này cần đăng nhập admin. Nếu upload ảnh, request dùng `multipart/form-data` và backend lưu file vào `backend/uploads`.

## Luồng Upload Ảnh

Backend lưu ảnh vào:

```text
backend/uploads
```

Database lưu đường dẫn:

```text
/uploads/file-name.jpg
```

Frontend dùng `frontend/src/utils/imageUrl.js` để đổi đường dẫn đó thành:

```text
http://localhost:5000/uploads/file-name.jpg
```

## Luồng Admin Đơn Hàng

Trang:

```text
frontend/src/pages/admin/ManageOrders.jsx
```

API:

```text
GET /api/orders
PUT /api/orders/:id/status
```

Trạng thái đơn hàng: `pending`, `processing`, `shipped`, `delivered`, `cancelled`.
