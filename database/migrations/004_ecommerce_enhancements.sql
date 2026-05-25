SET NAMES utf8mb4;
USE shop_quan_ao;

DELIMITER $$

DROP PROCEDURE IF EXISTS add_column_if_missing $$
CREATE PROCEDURE add_column_if_missing(
  IN table_name_param VARCHAR(64),
  IN column_name_param VARCHAR(64),
  IN column_definition_param TEXT
)
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = table_name_param
      AND COLUMN_NAME = column_name_param
  ) THEN
    SET @ddl = CONCAT('ALTER TABLE `', table_name_param, '` ADD COLUMN `', column_name_param, '` ', column_definition_param);
    PREPARE stmt FROM @ddl;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END $$

DELIMITER ;

CALL add_column_if_missing('users', 'avatar_url', 'VARCHAR(255) NULL AFTER `role`');
CALL add_column_if_missing('users', 'phone', 'VARCHAR(30) NULL AFTER `avatar_url`');
CALL add_column_if_missing('users', 'theme_preference', 'ENUM(''light'', ''dark'', ''system'') DEFAULT ''light'' AFTER `phone`');

CALL add_column_if_missing('products', 'gallery_json', 'JSON NULL AFTER `image_url`');

CALL add_column_if_missing('orders', 'subtotal_amount', 'DECIMAL(10, 2) NOT NULL DEFAULT 0 AFTER `user_id`');
CALL add_column_if_missing('orders', 'shipping_fee', 'DECIMAL(10, 2) NOT NULL DEFAULT 0 AFTER `subtotal_amount`');
CALL add_column_if_missing('orders', 'receiver_name', 'VARCHAR(255) NULL AFTER `status`');
CALL add_column_if_missing('orders', 'receiver_phone', 'VARCHAR(30) NULL AFTER `receiver_name`');
CALL add_column_if_missing('orders', 'province_code', 'VARCHAR(20) NULL AFTER `receiver_phone`');
CALL add_column_if_missing('orders', 'province_name', 'VARCHAR(255) NULL AFTER `province_code`');
CALL add_column_if_missing('orders', 'district_code', 'VARCHAR(20) NULL AFTER `province_name`');
CALL add_column_if_missing('orders', 'district_name', 'VARCHAR(255) NULL AFTER `district_code`');
CALL add_column_if_missing('orders', 'ward_code', 'VARCHAR(20) NULL AFTER `district_name`');
CALL add_column_if_missing('orders', 'ward_name', 'VARCHAR(255) NULL AFTER `ward_code`');
CALL add_column_if_missing('orders', 'hamlet', 'VARCHAR(255) NULL AFTER `ward_name`');
CALL add_column_if_missing('orders', 'address_line', 'TEXT NULL AFTER `hamlet`');
CALL add_column_if_missing('orders', 'shipping_note', 'TEXT NULL AFTER `address_line`');

DROP PROCEDURE IF EXISTS add_column_if_missing;

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
  hamlet VARCHAR(255),
  address_line TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  order_id INT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'order',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS product_likes (
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_comments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  user_id INT NOT NULL,
  rating TINYINT NOT NULL,
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_product_user_review (product_id, user_id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS product_tags (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(80) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS product_tag_map (
  product_id INT NOT NULL,
  tag_id INT NOT NULL,
  PRIMARY KEY (product_id, tag_id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES product_tags(id) ON DELETE CASCADE
);
