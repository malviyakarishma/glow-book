export type TransactionType = 'income' | 'expense';

export type OrderStatus = 'Upcoming' | 'Completed' | 'Cancelled';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  note?: string;
  order_id?: string | null;
  is_demo?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Order {
  id: string;
  customer_name: string;
  phone_number?: string;
  service_type: string;
  appointment_date: string; // YYYY-MM-DD
  appointment_time?: string; // e.g. "11:00 AM"
  total_price: number;
  advance_amount: number;
  remaining_balance: number;
  notes?: string;
  status: OrderStatus;
  is_demo?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SummaryStats {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  upcomingOrdersCount: number;
  pendingBalanceTotal: number;
}
