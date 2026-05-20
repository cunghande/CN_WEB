SET NAMES utf8mb4;
USE shop_quan_ao;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE order_items;
TRUNCATE TABLE orders;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- Mật khẩu demo cho tất cả tài khoản: 123456
INSERT INTO users (id, full_name, email, password, role) VALUES
(1, 'Admin Shop', 'admin@gmail.com', '$2a$10$.EhkzeS0tf966AoP8JLuZuty9GI8os3VlXZpf4e98XyDHqX3Hgaym', 'admin'),
(2, 'Nguyễn Văn A', 'a@gmail.com', '$2a$10$.EhkzeS0tf966AoP8JLuZuty9GI8os3VlXZpf4e98XyDHqX3Hgaym', 'customer'),
(3, 'Lê Thị B', 'b@gmail.com', '$2a$10$.EhkzeS0tf966AoP8JLuZuty9GI8os3VlXZpf4e98XyDHqX3Hgaym', 'customer'),
(4, 'Trần Minh Khôi', 'khoi@gmail.com', '$2a$10$.EhkzeS0tf966AoP8JLuZuty9GI8os3VlXZpf4e98XyDHqX3Hgaym', 'customer'),
(5, 'Phạm Ngọc Mai', 'mai@gmail.com', '$2a$10$.EhkzeS0tf966AoP8JLuZuty9GI8os3VlXZpf4e98XyDHqX3Hgaym', 'customer'),
(6, 'Hoàng Gia Hân', 'han@gmail.com', '$2a$10$.EhkzeS0tf966AoP8JLuZuty9GI8os3VlXZpf4e98XyDHqX3Hgaym', 'customer'),
(7, 'Đặng Quốc Bảo', 'bao@gmail.com', '$2a$10$.EhkzeS0tf966AoP8JLuZuty9GI8os3VlXZpf4e98XyDHqX3Hgaym', 'customer'),
(8, 'Võ Thanh Tâm', 'tam@gmail.com', '$2a$10$.EhkzeS0tf966AoP8JLuZuty9GI8os3VlXZpf4e98XyDHqX3Hgaym', 'customer');

INSERT INTO orders (id, user_id, total_amount, status) VALUES
(1, 2, 567000, 'delivered'),
(2, 3, 848000, 'processing'),
(3, 4, 1298000, 'shipped'),
(4, 5, 458000, 'pending'),
(5, 6, 987000, 'delivered'),
(6, 7, 699000, 'cancelled'),
(7, 2, 778000, 'pending'),
(8, 8, 1188000, 'processing');

INSERT INTO order_items (order_id, variant_id, quantity, unit_price) VALUES
(1, 1, 2, 189000),
(1, 5, 1, 189000),
(2, 16, 1, 199000),
(2, 99, 1, 699000),
(3, 49, 1, 629000),
(3, 101, 1, 699000),
(4, 2, 1, 189000),
(4, 29, 1, 269000),
(5, 61, 1, 429000),
(5, 57, 1, 459000),
(6, 100, 1, 699000),
(7, 121, 2, 389000),
(8, 169, 1, 459000),
(8, 173, 1, 489000);
