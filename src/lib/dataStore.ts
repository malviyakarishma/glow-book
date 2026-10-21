'use client';

import { useState, useEffect, useCallback } from 'react';
import { Order, Transaction } from './types';
import { localToday } from './dates';

const LOCAL_ORDERS_KEY = 'glowbook_local_orders';
const LOCAL_TX_KEY = 'glowbook_local_transactions';

export function useGlowBookData() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isNeonConnected, setIsNeonConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dbStatusMessage, setDbStatusMessage] = useState<string>('');

  // Fetch initial data
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Check status
      const statusRes = await fetch('/api/status');
      const statusData = await statusRes.json();
      const hasNeon = statusData.connected === true;
      setIsNeonConnected(hasNeon);
      setDbStatusMessage(statusData.message || '');

      if (hasNeon) {
        // Fetch from Neon DB API
        const [ordersRes, txRes] = await fetchOrdersAndTx();
        setOrders(ordersRes);
        setTransactions(txRes);
      } else {
        // Fallback to local storage
        loadFromLocalStorage();
      }
    } catch (err) {
      console.warn('API fetch failed, falling back to local storage:', err);
      setIsNeonConnected(false);
      loadFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  }, []);

  function loadFromLocalStorage() {
    if (typeof window === 'undefined') return;
    try {
      const storedOrders = localStorage.getItem(LOCAL_ORDERS_KEY);
      const storedTx = localStorage.getItem(LOCAL_TX_KEY);

      if (storedOrders) {
        const parsed: Order[] = JSON.parse(storedOrders);
        const filtered = Array.isArray(parsed) ? parsed.filter(o => !o.is_demo) : [];
        setOrders(filtered);
        if (Array.isArray(parsed) && filtered.length !== parsed.length) {
          localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(filtered));
        }
      } else {
        setOrders([]);
      }

      if (storedTx) {
        const parsed: Transaction[] = JSON.parse(storedTx);
        const filtered = Array.isArray(parsed) ? parsed.filter(t => !t.is_demo) : [];
        setTransactions(filtered);
        if (Array.isArray(parsed) && filtered.length !== parsed.length) {
          localStorage.setItem(LOCAL_TX_KEY, JSON.stringify(filtered));
        }
      } else {
        setTransactions([]);
      }
    } catch (e) {
      console.error('Failed to parse local storage', e);
    }
  }

  function saveToLocalStorage(newOrders: Order[], newTx: Transaction[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(newOrders));
      localStorage.setItem(LOCAL_TX_KEY, JSON.stringify(newTx));
    } catch (e) {
      console.error('Failed to save to local storage', e);
    }
  }

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const newId = (prefix: string) =>
    `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

  const createLocalOrder = (
    orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>,
    existingOrders: Order[],
    existingTx: Transaction[]
  ): { orders: Order[]; transactions: Transaction[] } => {
    const orderId = newId('ord');
    const newOrder: Order = {
      ...orderData,
      id: orderId,
      remaining_balance: Math.max(0, orderData.total_price - orderData.advance_amount),
      created_at: new Date().toISOString(),
    };

    let updatedTx = existingTx;
    if (orderData.advance_amount > 0) {
      const advanceTx: Transaction = {
        id: newId('tx_adv'),
        type: 'income',
        amount: orderData.advance_amount,
        category: orderData.service_type,
        date: orderData.appointment_date,
        note: `Advance payment for booking: ${orderData.customer_name}`,
        order_id: orderId,
        is_demo: orderData.is_demo,
        created_at: new Date().toISOString(),
      };
      updatedTx = [advanceTx, ...updatedTx];
    }

    return {
      orders: [newOrder, ...existingOrders],
      transactions: updatedTx,
    };
  };

  // 1. Add Order
  const addOrder = async (orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>) => {
    if (isNeonConnected) {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create booking');
      }
      await refreshData();
    } else {
      const next = createLocalOrder(orderData, orders, transactions);
      setOrders(next.orders);
      setTransactions(next.transactions);
      saveToLocalStorage(next.orders, next.transactions);
    }
  };

  // 1b. Add many orders (multi-date / multi-time booking)
  const addOrders = async (ordersData: Omit<Order, 'id' | 'created_at' | 'updated_at'>[]) => {
    if (!ordersData.length) return;

    if (isNeonConnected) {
      for (const orderData of ordersData) {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to create booking');
        }
      }
      await refreshData();
    } else {
      let nextOrders = [...orders];
      let nextTx = [...transactions];
      for (const orderData of ordersData) {
        const next = createLocalOrder(orderData, nextOrders, nextTx);
        nextOrders = next.orders;
        nextTx = next.transactions;
      }
      setOrders(nextOrders);
      setTransactions(nextTx);
      saveToLocalStorage(nextOrders, nextTx);
    }
  };

  // 2. Update Order
  const updateOrder = async (id: string, updates: Partial<Order>) => {
    if (isNeonConnected) {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update booking');
      }
      await refreshData();
    } else {
      const updatedOrders = orders.map(ord => {
        if (ord.id === id) {
          const newTotal = updates.total_price !== undefined ? updates.total_price : ord.total_price;
          const newAdvance = updates.advance_amount !== undefined ? updates.advance_amount : ord.advance_amount;
          return {
            ...ord,
            ...updates,
            remaining_balance: Math.max(0, newTotal - newAdvance),
            updated_at: new Date().toISOString(),
          };
        }
        return ord;
      });
      setOrders(updatedOrders);
      saveToLocalStorage(updatedOrders, transactions);
    }
  };

  // 3. Delete Order
  const deleteOrder = async (id: string) => {
    if (isNeonConnected) {
      const res = await fetch(`/api/orders?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete booking');
      }
      await refreshData();
    } else {
      const updatedOrders = orders.filter(o => o.id !== id);
      const updatedTx = transactions.filter(t => t.order_id !== id);
      setOrders(updatedOrders);
      setTransactions(updatedTx);
      saveToLocalStorage(updatedOrders, updatedTx);
    }
  };

  // 4. Record Balance Payment for Order
  const recordOrderPayment = async (
    orderId: string,
    amount: number,
    paymentDate: string,
    note?: string,
    markCompleted = true
  ) => {
    if (isNeonConnected) {
      const res = await fetch('/api/orders/collect-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, amount, paymentDate, note, markCompleted }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to record payment');
      }
      await refreshData();
    } else {
      const targetOrder = orders.find(o => o.id === orderId);
      if (!targetOrder) throw new Error('Order not found');

      const newAdvance = Number(targetOrder.advance_amount) + Number(amount);
      const newRemaining = Math.max(0, Number(targetOrder.total_price) - newAdvance);
      const shouldComplete = markCompleted || newRemaining === 0;

      const updatedOrders = orders.map(o =>
        o.id === orderId
          ? {
              ...o,
              advance_amount: newAdvance,
              remaining_balance: newRemaining,
              status: shouldComplete ? ('Completed' as const) : o.status,
              updated_at: new Date().toISOString(),
            }
          : o
      );

      const txId = 'tx_pay_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
      const paymentTx: Transaction = {
        id: txId,
        type: 'income',
        amount: Number(amount),
        category: targetOrder.service_type,
        date: paymentDate || localToday(),
        note: note?.trim() || `Payment received for ${targetOrder.customer_name} (${targetOrder.service_type})`,
        order_id: targetOrder.id,
        is_demo: targetOrder.is_demo,
        created_at: new Date().toISOString(),
      };

      const updatedTx = [paymentTx, ...transactions];
      setOrders(updatedOrders);
      setTransactions(updatedTx);
      saveToLocalStorage(updatedOrders, updatedTx);
    }
  };

  // 5. Add Transaction
  const addTransaction = async (txData: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => {
    if (isNeonConnected) {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(txData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create transaction');
      }
      await refreshData();
    } else {
      const txId = 'tx_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
      const newTx: Transaction = {
        ...txData,
        id: txId,
        created_at: new Date().toISOString(),
      };
      const updatedTx = [newTx, ...transactions];
      setTransactions(updatedTx);
      saveToLocalStorage(orders, updatedTx);
    }
  };

  // 6. Update Transaction
  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    if (isNeonConnected) {
      const res = await fetch('/api/transactions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update transaction');
      }
      await refreshData();
    } else {
      const updatedTx = transactions.map(t =>
        t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t
      );
      setTransactions(updatedTx);
      saveToLocalStorage(orders, updatedTx);
    }
  };

  // 7. Delete Transaction
  const deleteTransaction = async (id: string) => {
    if (isNeonConnected) {
      const res = await fetch(`/api/transactions?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to delete transaction');
      }
      await refreshData();
    } else {
      const updatedTx = transactions.filter(t => t.id !== id);
      setTransactions(updatedTx);
      saveToLocalStorage(orders, updatedTx);
    }
  };

  return {
    orders,
    transactions,
    isNeonConnected,
    isLoading,
    dbStatusMessage,
    refreshData,
    addOrder,
    addOrders,
    updateOrder,
    deleteOrder,
    recordOrderPayment,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
}

async function fetchOrdersAndTx(): Promise<[Order[], Transaction[]]> {
  const [ordersRes, txRes] = await Promise.all([
    fetch('/api/orders').then(r => r.json()),
    fetch('/api/transactions').then(r => r.json()),
  ]);
  return [ordersRes.orders || [], txRes.transactions || []];
}
