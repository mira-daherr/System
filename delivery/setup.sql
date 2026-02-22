-- ============================================================
-- Computer Center System - Database Setup
-- Run this script ONCE in MySQL to create the database.
-- Usage: Open MySQL Workbench, connect, then run this file.
-- ============================================================

CREATE DATABASE IF NOT EXISTS computersystem
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE computersystem;

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  username        VARCHAR(100) NOT NULL UNIQUE,
  password        VARCHAR(255) NOT NULL,
  status          ENUM('online', 'offline') DEFAULT 'offline',
  reset_code      VARCHAR(10) DEFAULT NULL,
  reset_code_expires DATETIME DEFAULT NULL,
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Default admin user  (password: admin123 — change this after first login)
INSERT IGNORE INTO users (username, password, status)
VALUES ('admin', 'admin123', 'offline');

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE,
  icon        VARCHAR(10)  DEFAULT '📦',
  color       VARCHAR(20)  DEFAULT '#FF3333',
  description TEXT         DEFAULT NULL,
  created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  price         DECIMAL(10,2) NOT NULL DEFAULT 0,
  initial_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  quantity      INT           NOT NULL DEFAULT 0,
  category      VARCHAR(100)  DEFAULT 'Uncategorized',
  image         VARCHAR(500)  DEFAULT NULL,
  is_active     TINYINT(1)    NOT NULL DEFAULT 1,
  created_at    DATETIME      DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- GAMES
-- ============================================================
CREATE TABLE IF NOT EXISTS games (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  name            VARCHAR(255)  NOT NULL,
  price_per_hour  DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_per_round DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_active       TINYINT(1)    NOT NULL DEFAULT 1,
  created_at      DATETIME      DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- EXPENSES
-- ============================================================
CREATE TABLE IF NOT EXISTS expenses (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  description VARCHAR(500)  NOT NULL,
  amount      DECIMAL(10,2) NOT NULL,
  date        DATE          NOT NULL,
  notes       TEXT          DEFAULT NULL,
  created_at  DATETIME      DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- CUSTOMERS
-- ============================================================
CREATE TABLE IF NOT EXISTS customers (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(255)  NOT NULL,
  total_debt  DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at  DATETIME      DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SALES
-- ============================================================
CREATE TABLE IF NOT EXISTS sales (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  customer_id      INT           DEFAULT NULL,
  customer_name    VARCHAR(255)  DEFAULT NULL,
  total_amount     DECIMAL(10,2) NOT NULL DEFAULT 0,
  paid_amount      DECIMAL(10,2) NOT NULL DEFAULT 0,
  remaining_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  notes            TEXT          DEFAULT NULL,
  sale_date        DATETIME      DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sales_customer FOREIGN KEY (customer_id)
    REFERENCES customers (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SALE ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS sale_items (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  sale_id    INT           NOT NULL,
  item_type  VARCHAR(50)   NOT NULL,
  item_id    INT           DEFAULT NULL,
  item_name  VARCHAR(255)  NOT NULL,
  quantity   INT           NOT NULL DEFAULT 1,
  price      DECIMAL(10,2) NOT NULL DEFAULT 0,
  total      DECIMAL(10,2) NOT NULL DEFAULT 0,
  CONSTRAINT fk_sale_items_sale FOREIGN KEY (sale_id)
    REFERENCES sales (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Done!
-- Default login: username = admin | password = admin123
-- ============================================================
