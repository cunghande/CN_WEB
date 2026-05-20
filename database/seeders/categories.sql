SET NAMES utf8mb4;
USE shop_quan_ao;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE categories;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO categories (id, name, description) VALUES
(1, 'Áo thun nam', 'Áo thun basic, oversize và graphic tee cho nam'),
(2, 'Áo thun nữ', 'Áo thun nữ, croptop và áo kiểu dễ phối'),
(3, 'Quần jean nam', 'Quần jean slim, straight và relaxed fit'),
(4, 'Quần short', 'Quần short kaki, jean và thun cho mùa hè'),
(5, 'Áo khoác', 'Áo khoác bomber, denim, blazer và chống nắng'),
(6, 'Váy công sở', 'Váy, đầm và chân váy thanh lịch'),
(7, 'Đồ tập gym', 'Trang phục thể thao co giãn, thoáng khí'),
(8, 'Phụ kiện', 'Túi, nón, thắt lưng, ví và phụ kiện thời trang'),
(9, 'Giày sneaker', 'Sneaker lifestyle, chạy bộ và phối đồ hằng ngày'),
(10, 'Đồ ngủ', 'Đồ mặc nhà, pyjama và set thoải mái'),
(11, 'Sơ mi trắng', 'Sơ mi trắng công sở và casual'),
(12, 'Sơ mi họa tiết', 'Sơ mi họa tiết nổi bật cho đi chơi'),
(13, 'Áo len', 'Áo len cổ lọ, cardigan và sweater'),
(14, 'Quần tây', 'Quần tây nam nữ thanh lịch'),
(15, 'Áo hoodie', 'Hoodie, sweater và áo nỉ đường phố');
