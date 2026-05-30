USE shop_quan_ao;
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS coupons (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  type ENUM('percent', 'free_shipping', 'shipping_percent') NOT NULL DEFAULT 'percent',
  discount_percent DECIMAL(5, 2) NOT NULL DEFAULT 0,
  max_discount_amount DECIMAL(10, 2) NULL,
  min_order_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  starts_at DATETIME NULL,
  expires_at DATETIME NULL,
  usage_limit INT NULL,
  used_count INT NOT NULL DEFAULT 0,
  per_user_limit INT NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  requires_claim BOOLEAN NOT NULL DEFAULT FALSE,
  claim_type VARCHAR(50) NOT NULL DEFAULT 'public',
  claim_min_items INT NOT NULL DEFAULT 0,
  claim_min_subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  claim_new_user_days INT NULL,
  event_title VARCHAR(255) NULL,
  event_description TEXT NULL,
  event_badge VARCHAR(80) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
