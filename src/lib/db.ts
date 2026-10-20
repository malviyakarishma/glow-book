import { neon } from '@neondatabase/serverless';
import { Order, Transaction } from './types';

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0);
}

function getSql() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not defined.');
  }
  return neon(url);
}

let isInitialized = false;

export async function ensureTablesExist(): Promise<void> {
  if (!isDatabaseConfigured() || isInitialized) return;
  const sql = getSql();
  
  await sql`
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
  `;

  await sql`
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
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(appointment_date);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_transactions_order_id ON transactions(order_id);`;

  isInitialized = true;
}

// Map database record to Order object
function mapDbOrder(row: Record<string, unknown>): Order {
  return {
    id: String(row.id),
    customer_name: String(row.customer_name),
    phone_number: row.phone_number ? String(row.phone_number) : undefined,
    service_type: String(row.service_type),
    appointment_date: String(row.appointment_date),
    appointment_time: row.appointment_time ? String(row.appointment_time) : undefined,
    total_price: Number(row.total_price),
    advance_amount: Number(row.advance_amount),
    remaining_balance: Number(row.remaining_balance),
    notes: row.notes ? String(row.notes) : undefined,
    status: (row.status as Order['status']) || 'Upcoming',
    is_demo: Boolean(row.is_demo),
    created_at: row.created_at ? new Date(row.created_at as string).toISOString() : undefined,
    updated_at: row.updated_at ? new Date(row.updated_at as string).toISOString() : undefined,
  };
}

// Map database record to Transaction object
function mapDbTx(row: Record<string, unknown>): Transaction {
  return {
    id: String(row.id),
    type: row.type as Transaction['type'],
    amount: Number(row.amount),
    category: String(row.category),
    date: String(row.date),
    note: row.note ? String(row.note) : undefined,
    order_id: row.order_id ? String(row.order_id) : undefined,
    is_demo: Boolean(row.is_demo),
    created_at: row.created_at ? new Date(row.created_at as string).toISOString() : undefined,
    updated_at: row.updated_at ? new Date(row.updated_at as string).toISOString() : undefined,
  };
}

// ORDERS OPERATIONS
export async function dbGetOrders(): Promise<Order[]> {
  await ensureTablesExist();
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM orders 
    ORDER BY appointment_date ASC, created_at DESC;
  `;
  return rows.map(mapDbOrder);
}

export async function dbCreateOrder(order: Omit<Order, 'created_at' | 'updated_at'>): Promise<Order> {
  await ensureTablesExist();
  const sql = getSql();
  const rows = await sql`
    INSERT INTO orders (
      id, customer_name, phone_number, service_type,
      appointment_date, appointment_time, total_price,
      advance_amount, remaining_balance, notes, status, is_demo
    ) VALUES (
      ${order.id}, ${order.customer_name}, ${order.phone_number || null}, ${order.service_type},
      ${order.appointment_date}, ${order.appointment_time || null}, ${order.total_price},
      ${order.advance_amount}, ${order.remaining_balance}, ${order.notes || null},
      ${order.status}, ${order.is_demo || false}
    )
    RETURNING *;
  `;
  return mapDbOrder(rows[0]);
}

export async function dbUpdateOrder(id: string, updates: Partial<Order>): Promise<Order> {
  await ensureTablesExist();
  const sql = getSql();
  
  // Calculate remaining balance if total_price or advance_amount changed
  const existing = (await sql`SELECT * FROM orders WHERE id = ${id};`)[0];
  if (!existing) throw new Error('Order not found');

  const customer_name = updates.customer_name ?? existing.customer_name;
  const phone_number = updates.phone_number !== undefined ? updates.phone_number : existing.phone_number;
  const service_type = updates.service_type ?? existing.service_type;
  const appointment_date = updates.appointment_date ?? existing.appointment_date;
  const appointment_time = updates.appointment_time !== undefined ? updates.appointment_time : existing.appointment_time;
  const total_price = updates.total_price !== undefined ? updates.total_price : Number(existing.total_price);
  const advance_amount = updates.advance_amount !== undefined ? updates.advance_amount : Number(existing.advance_amount);
  const remaining_balance = Math.max(0, total_price - advance_amount);
  const notes = updates.notes !== undefined ? updates.notes : existing.notes;
  const status = updates.status ?? existing.status;

  const rows = await sql`
    UPDATE orders SET
      customer_name = ${customer_name},
      phone_number = ${phone_number || null},
      service_type = ${service_type},
      appointment_date = ${appointment_date},
      appointment_time = ${appointment_time || null},
      total_price = ${total_price},
      advance_amount = ${advance_amount},
      remaining_balance = ${remaining_balance},
      notes = ${notes || null},
      status = ${status},
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *;
  `;
  return mapDbOrder(rows[0]);
}

export async function dbDeleteOrder(id: string): Promise<boolean> {
  await ensureTablesExist();
  const sql = getSql();
  // Also delete linked transactions or unlink them
  await sql`DELETE FROM transactions WHERE order_id = ${id};`;
  const result = await sql`DELETE FROM orders WHERE id = ${id} RETURNING id;`;
  return result.length > 0;
}

// TRANSACTIONS OPERATIONS
export async function dbGetTransactions(): Promise<Transaction[]> {
  await ensureTablesExist();
  const sql = getSql();
  const rows = await sql`
    SELECT * FROM transactions 
    ORDER BY date DESC, created_at DESC;
  `;
  return rows.map(mapDbTx);
}

export async function dbCreateTransaction(tx: Omit<Transaction, 'created_at' | 'updated_at'>): Promise<Transaction> {
  await ensureTablesExist();
  const sql = getSql();
  const rows = await sql`
    INSERT INTO transactions (
      id, type, amount, category, date, note, order_id, is_demo
    ) VALUES (
      ${tx.id}, ${tx.type}, ${tx.amount}, ${tx.category},
      ${tx.date}, ${tx.note || null}, ${tx.order_id || null}, ${tx.is_demo || false}
    )
    RETURNING *;
  `;
  return mapDbTx(rows[0]);
}

export async function dbUpdateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
  await ensureTablesExist();
  const sql = getSql();
  const existing = (await sql`SELECT * FROM transactions WHERE id = ${id};`)[0];
  if (!existing) throw new Error('Transaction not found');

  const type = updates.type ?? existing.type;
  const amount = updates.amount !== undefined ? updates.amount : Number(existing.amount);
  const category = updates.category ?? existing.category;
  const date = updates.date ?? existing.date;
  const note = updates.note !== undefined ? updates.note : existing.note;

  const rows = await sql`
    UPDATE transactions SET
      type = ${type},
      amount = ${amount},
      category = ${category},
      date = ${date},
      note = ${note || null},
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *;
  `;
  return mapDbTx(rows[0]);
}

export async function dbDeleteTransaction(id: string): Promise<boolean> {
  await ensureTablesExist();
  const sql = getSql();
  const result = await sql`DELETE FROM transactions WHERE id = ${id} RETURNING id;`;
  return result.length > 0;
}

// DEMO DATA MANAGEMENT
export async function dbClearDemoData(): Promise<void> {
  await ensureTablesExist();
  const sql = getSql();
  await sql`DELETE FROM transactions WHERE is_demo = TRUE;`;
  await sql`DELETE FROM orders WHERE is_demo = TRUE;`;
}
