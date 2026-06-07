USE shop_quan_ao;
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  coupon_id INT NOT NULL,
  user_id INT NOT NULL,
  order_id INT NOT NULL,
  discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  shipping_discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_coupon_redemptions_coupon (coupon_id),
  INDEX idx_coupon_redemptions_user (user_id),
  INDEX idx_coupon_redemptions_order (order_id),
  CONSTRAINT fk_coupon_redemptions_coupon
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
  CONSTRAINT fk_coupon_redemptions_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_coupon_redemptions_order
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
