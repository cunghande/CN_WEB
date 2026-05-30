USE shop_quan_ao;
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  category_id INT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  base_price DECIMAL(10, 2) NOT NULL,
  image_url VARCHAR(255) NULL,
  gallery_json JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_products_category (category_id),
  CONSTRAINT fk_products_category
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
