USE shop_quan_ao;
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NULL,
  subtotal_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  shipping_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
  coupon_code VARCHAR(50) NULL,
  discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  shipping_discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  receiver_name VARCHAR(255) NULL,
  receiver_phone VARCHAR(30) NULL,
  province_code VARCHAR(20) NULL,
  province_name VARCHAR(255) NULL,
  district_code VARCHAR(20) NULL,
  district_name VARCHAR(255) NULL,
  ward_code VARCHAR(20) NULL,
  ward_name VARCHAR(255) NULL,
  hamlet VARCHAR(255) NULL,
  address_line TEXT NULL,
  shipping_note TEXT NULL,
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_orders_user (user_id),
  CONSTRAINT fk_orders_user
    FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
