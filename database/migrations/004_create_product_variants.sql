USE shop_quan_ao;
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS product_variants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NULL,
  size VARCHAR(50) NULL,
  color VARCHAR(50) NULL,
  image_url VARCHAR(255) NULL,
  stock_quantity INT DEFAULT 0,
  INDEX idx_product_variants_product (product_id),
  CONSTRAINT fk_product_variants_product
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
