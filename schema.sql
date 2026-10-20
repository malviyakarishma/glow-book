-- GlowBook Database Schema for Neon PostgreSQL
-- Run this in your Neon SQL Editor or let the app run it automatically on start!

CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(64) PRIMARY KEY,
  customer_name VARCHAR(200) NOT NULL,
  phone_number VARCHAR(50),
  service_type VARCHAR(150) NOT NULL,
  appointment_date VARCHAR(10) NOT NULL,
  appointment_time VARCHAR(20),
  total_price NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0),
  advance_amount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (advance_amount >= 0),
  remaining_balance NUMERIC(10, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'Upcoming',
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(64) PRIMARY KEY,
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
  amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
  category VARCHAR(100) NOT NULL,
  date VARCHAR(10) NOT NULL,
  note TEXT,
  order_id VARCHAR(64) REFERENCES orders(id) ON DELETE SET NULL,
  is_demo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast date filtering and dashboard reporting
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_order_id ON transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(appointment_date);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
