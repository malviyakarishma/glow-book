import { NextRequest, NextResponse } from 'next/server';
import {
  isDatabaseConfigured,
  dbGetTransactions,
  dbCreateTransaction,
  dbUpdateTransaction,
  dbDeleteTransaction,
} from '@/lib/db';
import { Transaction } from '@/lib/types';

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ transactions: [], isDatabaseConfigured: false });
  }

  try {
    const transactions = await dbGetTransactions();
    return NextResponse.json({ transactions, isDatabaseConfigured: true });
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
    const { type, amount, category, date, note, order_id, is_demo } = body;

    if (!type || (type !== 'income' && type !== 'expense')) {
      return NextResponse.json({ error: 'Type must be "income" or "expense"' }, { status: 400 });
    }
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 });
    }
    if (!category || !category.trim()) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }
    if (!date || !date.trim()) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    const txId = 'tx_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);

    const txToCreate: Omit<Transaction, 'created_at' | 'updated_at'> = {
      id: txId,
      type,
      amount: numAmount,
      category: category.trim(),
      date: date.trim(),
      note: note?.trim() || undefined,
      order_id: order_id || null,
      is_demo: Boolean(is_demo),
    };

    const savedTx = await dbCreateTransaction(txToCreate);
    return NextResponse.json({ transaction: savedTx });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create transaction';
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
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
    }

    if (updates.amount !== undefined && Number(updates.amount) <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 });
    }

    const updated = await dbUpdateTransaction(id, updates);
    return NextResponse.json({ transaction: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to update transaction';
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
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
    }

    const success = await dbDeleteTransaction(id);
    return NextResponse.json({ success });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete transaction';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
