import { NextResponse } from 'next/server';
import {
  isDatabaseConfigured,
  dbClearDemoData,
  dbCreateOrder,
  dbCreateTransaction,
} from '@/lib/db';

export async function POST() {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

  const demoOrders = [
    {
      id: 'demo_ord_1',
      customer_name: 'Ananya Sharma (दुल्हन)',
      phone_number: '9876543210',
      service_type: 'Bridal Makeup',
      appointment_date: tomorrow,
      appointment_time: '10:30 AM',
      total_price: 15000,
      advance_amount: 5000,
      remaining_balance: 10000,
      notes: 'HD Bridal makeup with airbrush and jewelry setting.',
      status: 'Upcoming' as const,
      is_demo: true,
    },
    {
      id: 'demo_ord_2',
      customer_name: 'Pooja Verma',
      phone_number: '9812345678',
      service_type: 'Party Makeup',
      appointment_date: today,
      appointment_time: '04:00 PM',
      total_price: 3500,
      advance_amount: 1000,
      remaining_balance: 2500,
      notes: 'Engagement party makeup and soft curls hairstyle.',
      status: 'Upcoming' as const,
      is_demo: true,
    },
    {
      id: 'demo_ord_3',
      customer_name: 'Sunita Mehra',
      phone_number: '9899887766',
      service_type: 'Saree Draping',
      appointment_date: nextWeek,
      appointment_time: '02:00 PM',
      total_price: 2000,
      advance_amount: 500,
      remaining_balance: 1500,
      notes: 'Gujarati style pleating & iron press.',
      status: 'Upcoming' as const,
      is_demo: true,
    },
    {
      id: 'demo_ord_4',
      customer_name: 'Kavita Rao',
      phone_number: '9765432109',
      service_type: 'Facial & Cleanup',
      appointment_date: yesterday,
      appointment_time: '11:00 AM',
      total_price: 1800,
      advance_amount: 1800,
      remaining_balance: 0,
      notes: 'O3+ Diamond Glow Facial.',
      status: 'Completed' as const,
      is_demo: true,
    },
  ];

  const demoTransactions = [
    // Advances received from orders
    {
      id: 'demo_tx_adv_1',
      type: 'income' as const,
      amount: 5000,
      category: 'Bridal Makeup',
      date: yesterday,
      note: 'Advance received from Ananya Sharma for Bridal booking',
      order_id: 'demo_ord_1',
      is_demo: true,
    },
    {
      id: 'demo_tx_adv_2',
      type: 'income' as const,
      amount: 1000,
      category: 'Party Makeup',
      date: today,
      note: 'Advance received from Pooja Verma',
      order_id: 'demo_ord_2',
      is_demo: true,
    },
    {
      id: 'demo_tx_adv_3',
      type: 'income' as const,
      amount: 1800,
      category: 'Facial & Cleanup',
      date: yesterday,
      note: 'Full payment received from Kavita Rao',
      order_id: 'demo_ord_4',
      is_demo: true,
    },
    // Direct income
    {
      id: 'demo_tx_inc_1',
      type: 'income' as const,
      amount: 2200,
      category: 'Hairstyling',
      date: today,
      note: 'Walk-in client for Hair Spa & Blow Dry',
      order_id: null,
      is_demo: true,
    },
    // Expenses
    {
      id: 'demo_tx_exp_1',
      type: 'expense' as const,
      amount: 2400,
      category: 'Cosmetics & Products',
      date: yesterday,
      note: 'Kryolan translucent powder and makeup brushes',
      order_id: null,
      is_demo: true,
    },
    {
      id: 'demo_tx_exp_2',
      type: 'expense' as const,
      amount: 450,
      category: 'Travel & Transport',
      date: today,
      note: 'Auto rickshaw fare for home visit',
      order_id: null,
      is_demo: true,
    },
    {
      id: 'demo_tx_exp_3',
      type: 'expense' as const,
      amount: 1500,
      category: 'Equipment & Tools',
      date: yesterday,
      note: 'Professional curling rod',
      order_id: null,
      is_demo: true,
    },
  ];

  if (isDatabaseConfigured()) {
    try {
      await dbClearDemoData();
      for (const ord of demoOrders) {
        await dbCreateOrder(ord);
      }
      for (const tx of demoTransactions) {
        await dbCreateTransaction(tx);
      }
      return NextResponse.json({ success: true, message: 'Demo data loaded into Neon DB' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Database error';
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  // If local mode, return the demo items for client-side storage
  return NextResponse.json({
    success: true,
    demoOrders,
    demoTransactions,
    message: 'Demo data provided for local mode',
  });
}

export async function DELETE() {
  if (isDatabaseConfigured()) {
    try {
      await dbClearDemoData();
      return NextResponse.json({ success: true, message: 'Demo data removed from Neon DB' });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Database error';
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true, message: 'Demo data cleared locally' });
}
