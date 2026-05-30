USE shop_quan_ao;
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS product_comment_replies (
  id INT PRIMARY KEY AUTO_INCREMENT,
  comment_id INT NOT NULL,
  product_id INT NOT NULL,
  user_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_comment_replies_comment (comment_id),
  INDEX idx_comment_replies_product (product_id),
  INDEX idx_comment_replies_user (user_id),
  CONSTRAINT fk_comment_replies_comment
    FOREIGN KEY (comment_id) REFERENCES product_comments(id) ON DELETE CASCADE,
  CONSTRAINT fk_comment_replies_product
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_comment_replies_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
