# LUXURYWEAR - Website Quản Lý Bán Quần Áo

LUXURYWEAR là dự án e-commerce quản lý bán quần áo dùng React/Vite, Express và MySQL. Hệ thống có giao diện mua sắm cho khách hàng, giỏ hàng, đặt hàng COD, địa chỉ giao hàng, phí ship demo, hồ sơ người dùng, thông báo đơn hàng và trang quản trị sản phẩm/đơn hàng.

## Công Nghệ

- Frontend: React, Vite, Redux Toolkit, Tailwind CSS, lucide-react.
- Backend: Node.js, Express, MySQL2, JWT, bcryptjs, multer.
- Database: MySQL, schema `shop_quan_ao`.
- Dữ liệu địa chỉ: Province Open API `https://provinces.open-api.vn`.

## Cài Đặt

```bash
npm install
npm run install:all
```

## Tạo Database Và Dữ Liệu Demo

Chạy lần lượt các file SQL:

1. `database/migrations/001_create_users.sql`
2. `database/migrations/002_create_products.sql`
3. `database/migrations/003_create_orders.sql`
4. `database/migrations/004_ecommerce_enhancements.sql`
5. `database/seeders/categories.sql`
6. `database/seeders/products.sql`
7. `database/seeders/users.sql`
8. `database/seeders/social_demo.sql`

Seed có hơn 60 sản phẩm demo, nhiều biến thể size/màu/tồn kho, hashtag, lượt thích, bình luận, đánh giá, địa chỉ giao hàng và thông báo mẫu.

## Chạy Dự Án

```bash
npm run dev
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

Nếu chạy riêng:

```bash
npm run dev:backend
npm run dev:frontend
```

## Tài Khoản Demo

- Admin: `admin@gmail.com` / `123456`
- Khách hàng: `a@gmail.com` / `123456`

## Luồng Chính

- Mua hàng: `CartPage.jsx` -> `orderService.createOrderAPI()` -> `POST /api/orders` -> `order.routes.js` -> `order.controller.createOrder` -> `Order.model.create` -> MySQL.
- Địa chỉ: `AccountPage.jsx` -> `addressService`/`locationService` -> `/api/user/addresses` và `/api/locations/*` -> controller -> model/API tỉnh huyện xã.
- Chi tiết sản phẩm: `ProductDetailPage.jsx` -> `productService` -> `/api/products/:id` -> `product.controller.getProductById` -> `Product.model.findById`.
- Thông báo: admin đổi trạng thái đơn -> `order.controller.updateOrderStatus` -> `Notification.model.create` -> user đọc qua `/api/notifications`.

## Tác Giả

Dự án được phát triển bởi **Cung Do**.

- Email: `docung926@gmail.com`
- GitHub: [cunghande/CN_WEB](https://github.com/cunghande/CN_WEB)
