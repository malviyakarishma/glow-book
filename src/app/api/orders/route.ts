import { NextRequest, NextResponse } from 'next/server';
import {
  isDatabaseConfigured,
  dbGetOrders,
  dbCreateOrder,
  dbUpdateOrder,
  dbDeleteOrder,
  dbCreateTransaction,
} from '@/lib/db';
import { Order } from '@/lib/types';

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ orders: [], isDatabaseConfigured: false });
  }

  try {
    const orders = await dbGetOrders();
    return NextResponse.json({ orders, isDatabaseConfigured: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Database query error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: 'DATABASE_URL is not configured on the server.' },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    const {
      customer_name,
      phone_number,
      service_type,
      appointment_date,
      appointment_time,
      total_price,
      advance_amount,
      notes,
      status,
      is_demo,
    } = body;

    // Strict validation
    if (!customer_name || !customer_name.trim()) {
      return NextResponse.json({ error: 'Customer name is required' }, { status: 400 });
    }
    if (!appointment_date || !appointment_date.trim()) {
      return NextResponse.json({ error: 'Appointment date is required' }, { status: 400 });
    }

    const price = Number(total_price) || 0;
    const advance = Number(advance_amount) || 0;

    if (price < 0 || advance < 0) {
      return NextResponse.json({ error: 'Amounts cannot be negative' }, { status: 400 });
    }

    const remaining = Math.max(0, price - advance);
    const orderId = 'ord_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);

    const orderToCreate: Omit<Order, 'created_at' | 'updated_at'> = {
      id: orderId,
      customer_name: customer_name.trim(),
      phone_number: phone_number?.trim() || undefined,
      service_type: service_type?.trim() || 'General Service',
      appointment_date: appointment_date.trim(),
      appointment_time: appointment_time?.trim() || undefined,
      total_price: price,
      advance_amount: advance,
      remaining_balance: remaining,
      notes: notes?.trim() || undefined,
      status: status || 'Upcoming',
      is_demo: Boolean(is_demo),
    };

    const savedOrder = await dbCreateOrder(orderToCreate);

    // If advance amount was received, automatically record it as an income transaction
    let advanceTx = null;
    if (advance > 0) {
      const txId = 'tx_adv_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
      advanceTx = await dbCreateTransaction({
        id: txId,
        type: 'income',
        amount: advance,
        category: orderToCreate.service_type,
        date: orderToCreate.appointment_date,
        note: `Advance payment for booking: ${orderToCreate.customer_name}`,
        order_id: savedOrder.id,
        is_demo: savedOrder.is_demo,
      });
    }

    return NextResponse.json({ order: savedOrder, transaction: advanceTx });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create order';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: 'DATABASE_URL is not configured on the server.' },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    if (updates.total_price !== undefined && Number(updates.total_price) < 0) {
      return NextResponse.json({ error: 'Total price cannot be negative' }, { status: 400 });
    }
    if (updates.advance_amount !== undefined && Number(updates.advance_amount) < 0) {
      return NextResponse.json({ error: 'Advance amount cannot be negative' }, { status: 400 });
    }

    const updated = await dbUpdateOrder(id, updates);
    return NextResponse.json({ order: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update order';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { error: 'DATABASE_URL is not configured on the server.' },
      { status: 400 }
    );
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const success = await dbDeleteOrder(id);
    return NextResponse.json({ success });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete order';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
