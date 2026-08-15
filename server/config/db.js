const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');
const config = require('./config');

// Ensure database and uploads directory exists
const dbDir = path.dirname(config.dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}
if (!fs.existsSync(config.uploadDir)) {
  fs.mkdirSync(config.uploadDir, { recursive: true });
}

const db = new DatabaseSync(config.dbPath);

// Enable Foreign Keys and WAL mode for high performance
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');

function initSchema() {
  const schemaSql = `
    -- Users Table
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'vendeur',
      sub_role TEXT DEFAULT 'agriculteur',
      avatar TEXT DEFAULT 'assets/images/user-default.png',
      location TEXT DEFAULT 'Yaoundé, Cameroun',
      latitude REAL DEFAULT 3.8480,
      longitude REAL DEFAULT 11.5021,
      wallet_balance REAL DEFAULT 0,
      escrow_balance REAL DEFAULT 0,
      is_verified INTEGER DEFAULT 1,
      otp_code TEXT,
      otp_expires_at TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Products Table
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      seller_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      unit TEXT NOT NULL DEFAULT 'kg',
      stock_quantity REAL NOT NULL DEFAULT 0,
      min_order_quantity REAL DEFAULT 1,
      location TEXT DEFAULT 'Cameroun',
      latitude REAL DEFAULT 3.8480,
      longitude REAL DEFAULT 11.5021,
      image_url TEXT,
      is_organic INTEGER DEFAULT 0,
      is_available INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Orders Table
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      buyer_id INTEGER NOT NULL REFERENCES users(id),
      seller_id INTEGER NOT NULL REFERENCES users(id),
      product_id INTEGER NOT NULL REFERENCES products(id),
      quantity REAL NOT NULL,
      unit_price REAL NOT NULL,
      subtotal REAL NOT NULL,
      delivery_fee REAL DEFAULT 0,
      commission_fee REAL DEFAULT 0,
      total_amount REAL NOT NULL,
      delivery_address TEXT NOT NULL,
      buyer_notes TEXT,
      status TEXT NOT NULL DEFAULT 'EN_ATTENTE_PAIEMENT',
      payment_method TEXT,
      payment_phone TEXT,
      tracking_code TEXT,
      paid_at DATETIME,
      shipped_at DATETIME,
      delivered_at DATETIME,
      completed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Escrow Transactions Table
    CREATE TABLE IF NOT EXISTS escrow_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      buyer_id INTEGER NOT NULL REFERENCES users(id),
      seller_id INTEGER NOT NULL REFERENCES users(id),
      amount REAL NOT NULL,
      fee REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'HELD',
      payment_reference TEXT,
      payment_operator TEXT DEFAULT 'MTN_MOMO',
      locked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      released_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Notifications Table
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'system',
      reference_id INTEGER,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- AI Diagnostics Table
    CREATE TABLE IF NOT EXISTS ai_diagnostics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      target_type TEXT NOT NULL,
      crop_or_animal TEXT,
      symptoms TEXT NOT NULL,
      image_url TEXT,
      diagnosis_title TEXT NOT NULL,
      severity TEXT DEFAULT 'moyen',
      recommendations TEXT NOT NULL,
      organic_treatment TEXT,
      conventional_treatment TEXT,
      preventive_measures TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Chat History Table
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      session_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
    CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);
    CREATE INDEX IF NOT EXISTS idx_orders_seller ON orders(seller_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_notifs_user ON notifications(user_id, is_read);
    CREATE INDEX IF NOT EXISTS idx_chat_session ON chat_messages(session_id);
  `;

  db.exec(schemaSql);
}

initSchema();

module.exports = db;
