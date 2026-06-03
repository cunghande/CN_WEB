ALTER TABLE users
  ADD COLUMN status ENUM('active', 'blocked') NOT NULL DEFAULT 'active' AFTER role,
  ADD COLUMN last_login_at DATETIME NULL AFTER theme_preference,
  ADD COLUMN deleted_at DATETIME NULL AFTER last_login_at;
