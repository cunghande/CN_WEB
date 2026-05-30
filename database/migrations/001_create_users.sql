USE shop_quan_ao;
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  reset_password_token_hash VARCHAR(255) NULL,
  reset_password_otp_hash VARCHAR(255) NULL,
  reset_password_expires_at DATETIME NULL,
  reset_password_requested_at DATETIME NULL,
  role ENUM('admin', 'customer') DEFAULT 'customer',
  avatar_url VARCHAR(255) NULL,
  phone VARCHAR(30) NULL,
  gender ENUM('male', 'female', 'other', 'unspecified') DEFAULT 'unspecified',
  theme_preference ENUM('light', 'dark', 'system') DEFAULT 'light',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
