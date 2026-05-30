USE shop_quan_ao;
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS user_addresses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  receiver_name VARCHAR(255) NOT NULL,
  receiver_phone VARCHAR(30) NOT NULL,
  province_code VARCHAR(20) NOT NULL,
  province_name VARCHAR(255) NOT NULL,
  district_code VARCHAR(20) NOT NULL,
  district_name VARCHAR(255) NOT NULL,
  ward_code VARCHAR(20) NOT NULL,
  ward_name VARCHAR(255) NOT NULL,
  hamlet VARCHAR(255) NULL,
  address_line TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_addresses_user (user_id),
  CONSTRAINT fk_user_addresses_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
