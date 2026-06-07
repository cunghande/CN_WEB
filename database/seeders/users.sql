SET NAMES utf8mb4;
USE shop_quan_ao;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE order_items;
TRUNCATE TABLE orders;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- Mật khẩu demo cho tất cả tài khoản: 123456
INSERT INTO users (id, full_name, email, password, role, gender, phone) VALUES
(1, 'Admin Shop', 'admin@gmail.com', '$2a$10$.EhkzeS0tf966AoP8JLuZuty9GI8os3VlXZpf4e98XyDHqX3Hgaym', 'admin', 'unspecified', '0900000001'),
(2, 'Nguyễn Văn A', 'a@gmail.com', '$2a$10$.EhkzeS0tf966AoP8JLuZuty9GI8os3VlXZpf4e98XyDHqX3Hgaym', 'customer', 'male', '0900000002'),
(3, 'Lê Thị B', 'b@gmail.com', '$2a$10$.EhkzeS0tf966AoP8JLuZuty9GI8os3VlXZpf4e98XyDHqX3Hgaym', 'customer', 'female', '0900000003'),
(4, 'Trần Minh Khôi', 'khoi@gmail.com', '$2a$10$.EhkzeS0tf966AoP8JLuZuty9GI8os3VlXZpf4e98XyDHqX3Hgaym', 'customer', 'male', '0900000004'),
(5, 'Phạm Ngọc Mai', 'mai@gmail.com', '$2a$10$.EhkzeS0tf966AoP8JLuZuty9GI8os3VlXZpf4e98XyDHqX3Hgaym', 'customer', 'female', '0900000005'),
(6, 'Hoàng Gia Hân', 'han@gmail.com', '$2a$10$.EhkzeS0tf966AoP8JLuZuty9GI8os3VlXZpf4e98XyDHqX3Hgaym', 'customer', 'female', '0900000006'),
(7, 'Đặng Quốc Bảo', 'bao@gmail.com', '$2a$10$.EhkzeS0tf966AoP8JLuZuty9GI8os3VlXZpf4e98XyDHqX3Hgaym', 'customer', 'male', '0900000007'),
(8, 'Võ Thanh Tâm', 'tam@gmail.com', '$2a$10$.EhkzeS0tf966AoP8JLuZuty9GI8os3VlXZpf4e98XyDHqX3Hgaym', 'customer', 'other', '0900000008');

INSERT INTO orders (id, user_id, subtotal_amount, shipping_fee, total_amount, status, receiver_name, receiver_phone, province_name, district_name, ward_name, address_line) VALUES
(1, 2, 537000, 30000, 567000, 'delivered', 'Nguyễn Văn A', '0900000002', 'Hà Nội', 'Cầu Giấy', 'Dịch Vọng', '12 Xuân Thủy'),
(2, 3, 818000, 30000, 848000, 'processing', 'Lê Thị B', '0900000003', 'TP. Hồ Chí Minh', 'Quận 1', 'Bến Nghé', '45 Hai Bà Trưng'),
(3, 4, 1268000, 30000, 1298000, 'shipped', 'Trần Minh Khôi', '0900000004', 'Đà Nẵng', 'Hải Châu', 'Thạch Thang', '20 Bạch Đằng'),
(4, 5, 428000, 30000, 458000, 'pending', 'Phạm Ngọc Mai', '0900000005', 'Hải Phòng', 'Lê Chân', 'An Biên', '8 Trần Nguyên Hãn'),
(5, 6, 957000, 30000, 987000, 'delivered', 'Hoàng Gia Hân', '0900000006', 'Hưng Yên', 'Văn Lâm', 'Tân Quang', '15 Phố Nối'),
(6, 7, 669000, 30000, 699000, 'cancelled', 'Đặng Quốc Bảo', '0900000007', 'Bắc Ninh', 'Từ Sơn', 'Đông Ngàn', '3 Lý Thái Tổ'),
(7, 2, 748000, 30000, 778000, 'pending', 'Nguyễn Văn A', '0900000002', 'Hà Nội', 'Cầu Giấy', 'Dịch Vọng', '12 Xuân Thủy'),
(8, 8, 1158000, 30000, 1188000, 'processing', 'Võ Thanh Tâm', '0900000008', 'Cần Thơ', 'Ninh Kiều', 'An Cư', '9 Nguyễn Trãi');

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
