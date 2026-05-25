SET NAMES utf8mb4;
USE shop_quan_ao;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE product_tag_map;
TRUNCATE TABLE product_tags;
TRUNCATE TABLE product_likes;
TRUNCATE TABLE product_comments;
TRUNCATE TABLE product_reviews;
TRUNCATE TABLE notifications;
TRUNCATE TABLE user_addresses;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO product_tags (id, name, slug) VALUES
(1, 'basic', 'basic'),
(2, 'cong-so', 'cong-so'),
(3, 'streetwear', 'streetwear'),
(4, 'unisex', 'unisex'),
(5, 'he-2026', 'he-2026'),
(6, 'premium', 'premium'),
(7, 'the-thao', 'the-thao'),
(8, 'du-lich', 'du-lich'),
(9, 'toi-gian', 'toi-gian'),
(10, 'ban-chay', 'ban-chay');

INSERT INTO product_tag_map (product_id, tag_id)
SELECT p.id, t.id
FROM products p
JOIN product_tags t ON (
  (p.id % 10 = 0 AND t.slug IN ('premium', 'toi-gian', 'ban-chay')) OR
  (p.id % 10 = 1 AND t.slug IN ('basic', 'he-2026')) OR
  (p.id % 10 = 2 AND t.slug IN ('streetwear', 'unisex')) OR
  (p.id % 10 = 3 AND t.slug IN ('cong-so', 'premium')) OR
  (p.id % 10 = 4 AND t.slug IN ('du-lich', 'he-2026')) OR
  (p.id % 10 = 5 AND t.slug IN ('the-thao', 'unisex')) OR
  (p.id % 10 = 6 AND t.slug IN ('toi-gian', 'basic')) OR
  (p.id % 10 = 7 AND t.slug IN ('ban-chay', 'streetwear')) OR
  (p.id % 10 = 8 AND t.slug IN ('cong-so', 'toi-gian')) OR
  (p.id % 10 = 9 AND t.slug IN ('premium', 'du-lich'))
);

INSERT INTO product_likes (user_id, product_id) VALUES
(2, 1), (2, 5), (2, 12), (2, 20), (2, 33),
(3, 1), (3, 2), (3, 18), (3, 24), (3, 35),
(4, 4), (4, 8), (4, 21), (4, 30), (4, 45),
(5, 7), (5, 14), (5, 19), (5, 36), (5, 50),
(6, 3), (6, 11), (6, 27), (6, 40), (6, 58);

INSERT INTO product_comments (product_id, user_id, content) VALUES
(1, 2, 'Áo mặc mát, form đúng mô tả. Shop nên thêm màu be nữa.'),
(1, 3, 'Chất vải ổn trong tầm giá, giao hàng nhanh.'),
(5, 4, 'Màu lên ảnh khá chuẩn, phối với jean rất dễ.'),
(12, 5, 'Form relaxed thoải mái, hợp mặc đi chơi cuối tuần.'),
(18, 6, 'Áo khoác denim dày vừa, không bị cứng.'),
(24, 7, 'Chân váy xếp ly đẹp, đường may gọn.'),
(30, 8, 'Túi tote rộng, đựng laptop 13 inch vừa.'),
(35, 2, 'Sneaker canvas nhẹ, đi học rất tiện.'),
(42, 3, 'Sơ mi trắng mặc công sở nhìn sạch và lịch sự.'),
(55, 4, 'Set phối rất đẹp, phù hợp demo bán hàng.');

INSERT INTO product_reviews (product_id, user_id, rating, content) VALUES
(1, 2, 5, 'Sản phẩm đáng tiền, size chuẩn.'),
(1, 3, 4, 'Chất ổn, nếu có thêm bảng size chi tiết sẽ tốt hơn.'),
(5, 4, 5, 'Mặc đẹp và dễ phối đồ.'),
(12, 5, 4, 'Form đẹp, màu wash hợp xu hướng.'),
(18, 6, 5, 'Áo khoác nổi bật nhất trong danh mục.'),
(24, 7, 4, 'Dáng váy tốt, chất vải khá mềm.'),
(30, 8, 5, 'Phụ kiện hữu ích, giá hợp lý.'),
(35, 2, 4, 'Giày nhẹ, ảnh sản phẩm rõ.'),
(42, 3, 5, 'Sơ mi lên form rất ổn.'),
(55, 4, 5, 'Phù hợp khách thích phong cách tối giản.');

INSERT INTO user_addresses (
  user_id, receiver_name, receiver_phone,
  province_code, province_name, district_code, district_name, ward_code, ward_name,
  hamlet, address_line, is_default
) VALUES
(2, 'Nguyễn Văn A', '0901234567', '01', 'Thành phố Hà Nội', '001', 'Quận Ba Đình', '00001', 'Phường Phúc Xá', 'Tổ 4', 'Số 12 ngõ 5 đường Hồng Hà', TRUE),
(3, 'Lê Thị B', '0912345678', '79', 'Thành phố Hồ Chí Minh', '760', 'Quận 1', '26734', 'Phường Tân Định', 'Khu phố 2', '45 Hai Bà Trưng', TRUE),
(4, 'Trần Minh Khôi', '0923456789', '48', 'Thành phố Đà Nẵng', '490', 'Quận Liên Chiểu', '20194', 'Phường Hòa Minh', 'Tổ 9', '18 Nguyễn Sinh Sắc', TRUE);

INSERT INTO notifications (user_id, order_id, title, message, type, is_read) VALUES
(2, 7, 'Đơn hàng đang chờ xử lý', 'Shop đã nhận đơn hàng #7 và sẽ xác nhận trong thời gian sớm nhất.', 'order', FALSE),
(3, 2, 'Đơn hàng đang chuẩn bị', 'Đơn hàng #2 đang được đóng gói trước khi bàn giao vận chuyển.', 'order', FALSE),
(4, 3, 'Đơn hàng đang giao', 'Đơn hàng #3 đã rời kho và đang trên đường giao đến bạn.', 'order', FALSE);
