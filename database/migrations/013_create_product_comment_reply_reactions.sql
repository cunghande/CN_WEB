USE shop_quan_ao;
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS product_comment_reply_reactions (
  reply_id INT NOT NULL,
  user_id INT NOT NULL,
  reaction ENUM('like', 'dislike') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (reply_id, user_id),
  INDEX idx_reply_reactions_user (user_id),
  CONSTRAINT fk_reply_reactions_reply
    FOREIGN KEY (reply_id) REFERENCES product_comment_replies(id) ON DELETE CASCADE,
  CONSTRAINT fk_reply_reactions_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
