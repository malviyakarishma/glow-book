import { NextRequest, NextResponse } from 'next/server';
import {
  isDatabaseConfigured,
  dbGetOrders,
  dbUpdateOrder,
  dbCreateTransaction,
} from '@/lib/db';

export async function POST(req: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: 'DATABASE_URL is not configured on the server.' },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    const { orderId, amount, paymentDate, note, markCompleted } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const payAmount = Number(amount);
    if (isNaN(payAmount) || payAmount <= 0) {
      return NextResponse.json({ error: 'Payment amount must be greater than 0' }, { status: 400 });
    }

    const allOrders = await dbGetOrders();
    const existingOrder = allOrders.find(o => o.id === orderId);

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const dateStr = paymentDate || new Date().toISOString().split('T')[0];
    const newAdvance = Number(existingOrder.advance_amount) + payAmount;
    const newRemaining = Math.max(0, Number(existingOrder.total_price) - newAdvance);

    const shouldComplete = markCompleted || newRemaining === 0;
    const newStatus = shouldComplete ? 'Completed' : existingOrder.status;

    // 1. Create unique income transaction for this received payment
    const txId = 'tx_pay_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
    const paymentTx = await dbCreateTransaction({
      id: txId,
      type: 'income',
      amount: payAmount,
      category: existingOrder.service_type,
      date: dateStr,
      note: note?.trim() || `Payment received for ${existingOrder.customer_name} (${existingOrder.service_type})`,
      order_id: existingOrder.id,
      is_demo: existingOrder.is_demo,
    });

    // 2. Update order with new advance received and recalculated remaining balance
    const updatedOrder = await dbUpdateOrder(orderId, {
      advance_amount: newAdvance,
      remaining_balance: newRemaining,
      status: newStatus,
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      transaction: paymentTx,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to record payment';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
