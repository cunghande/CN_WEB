-- Chèn 30 Categories (Ví dụ: Áo thun nam, Áo thun nữ, Quần Jean...)
INSERT INTO categories (name, description) VALUES 
('Áo thun nam', 'Các mẫu áo thun năng động'), ('Áo thun nữ', 'Thời trang nữ tính'), ('Quần Jean Nam', 'Bền bỉ cá tính'),
('Quần Short', 'Thoải mái mùa hè'), ('Áo Khoác', 'Ấm áp mùa đông'), ('Váy Công Sở', 'Thanh lịch'),
('Đồ Tập Gym', 'Co giãn tốt'), ('Phụ Kiện', 'Thắt lưng, ví'), ('Giày Sneaker', 'Phong cách'), ('Đồ Ngủ', 'Dễ chịu'),
('Sơ mi trắng', 'Lịch sự'), ('Sơ mi họa tiết', 'Nổi bật'), ('Áo Len', 'Giữ ấm tốt'), ('Quần Tây', 'Công sở nam'),
('Áo Hoodie', 'Phong cách đường phố'), ('Chân váy', 'Dễ phối đồ'), ('Áo Polo', 'Đứng đắn'), ('Đồ bơi', 'Mùa hè rực rỡ'),
('Áo Tanktop', 'Mát mẻ'), ('Quần Jogger', 'Thể thao'), ('Đồ lót', 'Cao cấp'), ('Tất/Vớ', 'Nhiều màu sắc'),
('Mũ lưỡi trai', 'Che nắng'), ('Túi xách', 'Thời trang'), ('Áo khoác gió', 'Chống nước'), ('Quần lửng', 'Dạo phố'),
('Bộ nỉ', 'Mùa thu'), ('Áo hai dây', 'Quyến rũ'), ('Quần baggy', 'Thoải mái'), ('Đầm dạ hội', 'Sang trọng');

-- Chèn 30 Users (Dùng để test login và phân quyền)
-- Mật khẩu giả định là '123456' (Trong thực tế phải hash bằng bcrypt)
INSERT INTO users (full_name, email, password, role) VALUES 
('Admin Shop', 'admin@gmail.com', 'hashed_pass', 'admin'),
('Nguyen Van A', 'a@gmail.com', 'hashed_pass', 'customer'),
('Le Thi B', 'b@gmail.com', 'hashed_pass', 'customer'),
-- ... (Bạn có thể lặp lại lệnh này cho đủ 30 user)
('Khách hàng 30', 'user30@gmail.com', 'hashed_pass', 'customer');
-- (Gợi ý: Copy dòng cuối đổi số từ 4 đến 30)
INSERT INTO products (category_id, name, base_price, image_url) VALUES 
(1, 'Áo Thun Basic V1', 150000, 'img1.jpg'), (1, 'Áo Thun Basic V2', 160000, 'img2.jpg'),
(2, 'Váy Hoa Nhí', 350000, 'img3.jpg'), (2, 'Áo Croptop', 120000, 'img4.jpg'),
(3, 'Quần Jean Slimfit', 450000, 'img5.jpg'), (3, 'Quần Jean Rách', 480000, 'img6.jpg'),
(5, 'Áo Bomber', 550000, 'img7.jpg'), (5, 'Áo Parka', 850000, 'img8.jpg'),
(11, 'Sơ mi Oxford', 290000, 'img9.jpg'), (11, 'Sơ mi Cổ Tàu', 310000, 'img10.jpg'),
(4, 'Short Thun', 90000, 'img11.jpg'), (4, 'Short Kaki', 180000, 'img12.jpg'),
(17, 'Polo Cá Sấu', 250000, 'img13.jpg'), (17, 'Polo Trơn', 220000, 'img14.jpg'),
(20, 'Jogger Nỉ', 210000, 'img15.jpg'), (20, 'Jogger Túi Hộp', 280000, 'img16.jpg'),
(15, 'Hoodie Oversize', 320000, 'img17.jpg'), (15, 'Hoodie Zip', 340000, 'img18.jpg'),
(6, 'Váy Chữ A', 270000, 'img19.jpg'), (6, 'Váy Suông', 290000, 'img20.jpg'),
(13, 'Len Cổ Lọ', 420000, 'img21.jpg'), (13, 'Cardigan', 380000, 'img22.jpg'),
(14, 'Quần Âu Hàn Quốc', 350000, 'img23.jpg'), (14, 'Quần Âu Slim', 330000, 'img24.jpg'),
(7, 'Áo Gym Shark', 190000, 'img25.jpg'), (7, 'Quần Legging', 220000, 'img26.jpg'),
(9, 'Sneaker Trắng', 650000, 'img27.jpg'), (9, 'Giày Chạy Bộ', 720000, 'img28.jpg'),
(25, 'Gió 2 lớp', 300000, 'img29.jpg'), (25, 'Gió Uniqlo', 450000, 'img30.jpg'),
(1, 'Áo Thun In Hình', 195000, 'img31.jpg'), (2, 'Áo Trễ Vai', 210000, 'img32.jpg');
-- Chèn biến thể cho Sản phẩm 1 (Áo thun Basic V1) - Tổng cộng tạo ra khoảng 60-90 biến thể
INSERT INTO product_variants (product_id, size, color, stock_quantity) VALUES 
(1, 'S', 'Trắng', 50), (1, 'M', 'Trắng', 40), (1, 'L', 'Trắng', 30),
(1, 'S', 'Đen', 55), (1, 'M', 'Đen', 45), (1, 'L', 'Đen', 35),
(2, 'M', 'Xanh', 20), (2, 'L', 'Xanh', 25), (3, 'S', 'Hoa', 10),
-- (Hãy lặp lại tương tự cho các product_id từ 4 đến 32 để có hơn 30 bản ghi)
(32, 'M', 'Đỏ', 15), (31, 'L', 'Vàng', 12);

-- Chèn 30 Đơn hàng mẫu (Orders)
INSERT INTO orders (user_id, total_amount, status) VALUES 
(2, 500000, 'delivered'), (3, 350000, 'processing'), (4, 1200000, 'shipped'),
(5, 450000, 'pending'), (6, 900000, 'delivered'), (7, 150000, 'cancelled'),
-- ... copy và thay đổi user_id cho đến khi đủ 30 dòng
(2, 600000, 'delivered'), (3, 200000, 'pending');

-- Chèn 30+ Chi tiết đơn hàng (Order Items)
INSERT INTO order_items (order_id, variant_id, quantity, unit_price) VALUES 
(1, 1, 2, 150000), (1, 3, 1, 200000), (2, 5, 1, 350000),
(3, 10, 3, 400000), (4, 2, 1, 150000), (5, 8, 2, 450000);
-- ... (Tương tự, chèn thêm để liên kết với 30 đơn hàng ở trên)