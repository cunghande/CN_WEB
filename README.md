# LUXURYWEAR - Web Quản Lý Bán Quần Áo

LUXURYWEAR là dự án website quản lý bán quần áo dùng React/Vite, Express và MySQL. Hệ thống có giao diện mua sắm cho khách hàng, giỏ hàng, đặt hàng COD và trang quản trị để theo dõi dashboard, sản phẩm, biến thể size/màu/tồn kho và đơn hàng.

## Công Nghệ

- Frontend: React, Vite, Redux Toolkit, Tailwind CSS, lucide-react.
- Backend: Node.js, Express, MySQL2, JWT, bcryptjs, multer.
- Database: MySQL, schema `shop_quan_ao`.

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
4. `database/seeders/categories.sql`
5. `database/seeders/products.sql`
6. `database/seeders/users.sql`

Seed hiện có 15 danh mục, 60 sản phẩm demo, mỗi sản phẩm có nhiều biến thể size/màu/tồn kho.

## Chạy Dự Án

```bash
npm run dev
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

## Tài Khoản Demo

- Admin: `admin@gmail.com` / `123456`
- Khách hàng: `a@gmail.com` / `123456`

## Tác Giả

Dự án được phát triển bởi **Cung Do**.

- Email: `docung926@gmail.com`
- GitHub: [cunghande/CN_WEB](https://github.com/cunghande/CN_WEB)
