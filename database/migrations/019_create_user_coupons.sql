USE shop_quan_ao;
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS user_coupons (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  coupon_id INT NOT NULL,
  status ENUM('available', 'used', 'expired') NOT NULL DEFAULT 'available',
  source VARCHAR(80) NOT NULL DEFAULT 'event',
  claimed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NULL,
  used_order_id INT NULL,
  used_at DATETIME NULL,
  UNIQUE KEY uq_user_coupon (user_id, coupon_id),
  INDEX idx_user_coupon_user_status (user_id, status),
  INDEX idx_user_coupon_coupon (coupon_id),
  INDEX idx_user_coupon_used_order (used_order_id),
  CONSTRAINT fk_user_coupons_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_coupons_coupon
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_coupons_used_order
    FOREIGN KEY (used_order_id) REFERENCES orders(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
