USE shop_quan_ao;
SET NAMES utf8mb4;

INSERT INTO coupons
  (code, name, type, discount_percent, max_discount_amount, min_order_amount, starts_at, expires_at, usage_limit, per_user_limit, is_active,
   requires_claim, claim_type, claim_min_items, claim_min_subtotal, claim_new_user_days, event_title, event_description, event_badge, sort_order)
VALUES
  ('WELCOME10', 'Giảm 10% cho đơn đầu demo', 'percent', 10, 50000, 200000, NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY), 200, 1, TRUE,
   FALSE, 'public', 0, 0, NULL, 'Mã nhập nhanh WELCOME10', 'Nhập mã trực tiếp khi thanh toán cho đơn từ 200.000đ.', 'Nhập mã', 10),
  ('SALE20', 'Giảm 20% tối đa 120.000đ', 'percent', 20, 120000, 500000, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 80, 1, TRUE,
   FALSE, 'public', 0, 0, NULL, 'Flash sale SALE20', 'Nhập mã trực tiếp cho đơn từ 500.000đ, số lượng có hạn.', 'Flash sale', 20),
  ('FREESHIP', 'Miễn phí vận chuyển', 'free_shipping', 100, NULL, 150000, NOW(), DATE_ADD(NOW(), INTERVAL 60 DAY), 150, 2, TRUE,
   FALSE, 'public', 0, 0, NULL, 'Mã freeship cơ bản', 'Miễn phí vận chuyển cho đơn từ 150.000đ.', 'Free ship', 30),
  ('SHIP50', 'Giảm 50% phí vận chuyển', 'shipping_percent', 50, 30000, 0, NOW(), DATE_ADD(NOW(), INTERVAL 60 DAY), 150, 2, TRUE,
   FALSE, 'public', 0, 0, NULL, 'Giảm nửa phí ship', 'Giảm 50% phí vận chuyển, tối đa 30.000đ.', 'Ship', 40),
  ('NEW30', 'User mới giảm 30%', 'percent', 30, 150000, 500000, NOW(), DATE_ADD(NOW(), INTERVAL 45 DAY), 300, 1, TRUE,
   TRUE, 'new_user', 0, 0, 7, 'Tân binh nhận quà 30%', 'Tài khoản mới trong 7 ngày nhận mã giảm 30% cho đơn từ 500.000đ.', 'User mới', 50),
  ('NEWFREESHIP', 'User mới miễn phí vận chuyển', 'free_shipping', 100, NULL, 0, NOW(), DATE_ADD(NOW(), INTERVAL 45 DAY), 300, 1, TRUE,
   TRUE, 'new_user', 0, 0, 7, 'Freeship chào mừng', 'Tài khoản mới trong 7 ngày nhận một mã miễn phí vận chuyển.', 'User mới', 60),
  ('BUY3SHIP', 'Mua 3 sản phẩm bất kỳ nhận freeship', 'free_shipping', 100, NULL, 0, NOW(), DATE_ADD(NOW(), INTERVAL 60 DAY), 250, 1, TRUE,
   TRUE, 'cart_item_count', 3, 0, NULL, 'Mua 3 món nhận freeship', 'Thêm đủ 3 sản phẩm bất kỳ vào giỏ để nhận mã miễn phí vận chuyển.', 'Nhiệm vụ giỏ hàng', 70),
  ('MILLION30', 'Đơn trên 1 triệu giảm 30%', 'percent', 30, 350000, 1000000, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 100, 1, TRUE,
   TRUE, 'cart_subtotal', 0, 1000000, NULL, 'Đơn lớn giảm sâu', 'Giỏ hàng đạt từ 1.000.000đ để nhận voucher giảm 30%, tối đa 350.000đ.', 'Đơn lớn', 80),
  ('OVER400K20', 'Đơn từ 400K giảm 20%', 'percent', 20, 100000, 400000, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 500, 1, TRUE,
   TRUE, 'cart_subtotal', 0, 400000, NULL, 'Đơn từ 400K nhận mã 20%', 'Giỏ hàng đạt từ 400.000đ để nhận mã giảm 20%, tối đa 100.000đ.', 'Giảm mạnh', 85),
  ('OVER200K15', 'Đơn từ 200.000đ giảm 15%', 'percent', 15, 80000, 200000, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 200, 1, TRUE,
   TRUE, 'cart_subtotal', 0, 200000, NULL, 'Đơn từ 200K nhận 15%', 'Giỏ hàng đạt từ 200.000đ để nhận mã giảm 15%, tối đa 80.000đ.', 'Dễ nhận', 90),
  ('STYLE25', 'Combo outfit giảm 25%', 'percent', 25, 180000, 700000, NOW(), DATE_ADD(NOW(), INTERVAL 21 DAY), 120, 1, TRUE,
   TRUE, 'cart_item_count', 2, 700000, NULL, 'Phối đồ đủ bộ giảm 25%', 'Có ít nhất 2 sản phẩm và tổng giỏ từ 700.000đ để nhận voucher.', 'Combo', 100)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  type = VALUES(type),
  discount_percent = VALUES(discount_percent),
  max_discount_amount = VALUES(max_discount_amount),
  min_order_amount = VALUES(min_order_amount),
  starts_at = VALUES(starts_at),
  expires_at = VALUES(expires_at),
  usage_limit = VALUES(usage_limit),
  per_user_limit = VALUES(per_user_limit),
  is_active = VALUES(is_active),
  requires_claim = VALUES(requires_claim),
  claim_type = VALUES(claim_type),
  claim_min_items = VALUES(claim_min_items),
  claim_min_subtotal = VALUES(claim_min_subtotal),
  claim_new_user_days = VALUES(claim_new_user_days),
  event_title = VALUES(event_title),
  event_description = VALUES(event_description),
  event_badge = VALUES(event_badge),
  sort_order = VALUES(sort_order);
