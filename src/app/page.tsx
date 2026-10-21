'use client';

import React, { useState, useEffect } from 'react';
import { Check, Info } from 'lucide-react';
import { useGlowBookData } from '@/lib/dataStore';
import { Language, translations } from '@/lib/translations';
import { Order, Transaction, TransactionType, OrderStatus } from '@/lib/types';

import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { DashboardView } from '@/components/DashboardView';
import { TransactionsView } from '@/components/TransactionsView';
import { OrdersView } from '@/components/OrdersView';
import { TransactionModal } from '@/components/TransactionModal';
import { OrderModal } from '@/components/OrderModal';
import { CollectPaymentModal } from '@/components/CollectPaymentModal';
import { ConfirmModal } from '@/components/ConfirmModal';

export default function Home() {
  // Language State
  const [lang, setLang] = useState<Language>('hi');

  useEffect(() => {
    const savedLang = localStorage.getItem('glowbook_lang');
    if (savedLang === 'en' || savedLang === 'hi') {
      setLang(savedLang);
    }
  }, []);

  const handleToggleLang = () => {
    const newLang = lang === 'en' ? 'hi' : 'en';
    setLang(newLang);
    localStorage.setItem('glowbook_lang', newLang);
  };

  const t = translations[lang];

  // Active View Tab ('dashboard' | 'transactions' | 'orders')
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'orders'>('dashboard');

  // Backend / Persistent Data Hook
  const {
    orders,
    transactions,
    isNeonConnected,
    isLoading,
    addOrder,
    addOrders,
    updateOrder,
    deleteOrder,
    recordOrderPayment,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useGlowBookData();

  // Toast message state
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Modal States
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txDefaultType, setTxDefaultType] = useState<TransactionType>('income');
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [payingOrder, setPayingOrder] = useState<Order | null>(null);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    desc?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    onConfirm: () => {},
  });

  // Modal Triggers
  const handleOpenAddIncome = () => {
    setEditingTx(null);
    setTxDefaultType('income');
    setIsTxModalOpen(true);
  };

  const handleOpenAddExpense = () => {
    setEditingTx(null);
    setTxDefaultType('expense');
    setIsTxModalOpen(true);
  };

  const handleEditTx = (tx: Transaction) => {
    setEditingTx(tx);
    setTxDefaultType(tx.type);
    setIsTxModalOpen(true);
  };

  const handleDeleteTx = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: t.confirmDeleteTx,
      desc: t.confirmDeleteDesc,
      onConfirm: async () => {
        await deleteTransaction(id);
        showToast(t.deleteSuccess);
      },
    });
  };

  const handleOpenAddOrder = () => {
    setEditingOrder(null);
    setIsOrderModalOpen(true);
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setIsOrderModalOpen(true);
  };

  const handleDeleteOrder = (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: t.confirmDeleteOrder,
      desc: t.confirmDeleteDesc,
      onConfirm: async () => {
        await deleteOrder(id);
        showToast(t.deleteSuccess);
      },
    });
  };

  const handleCollectPayment = (order: Order) => {
    setPayingOrder(order);
    setIsPaymentModalOpen(true);
  };

  const handleUpdateOrderStatus = async (id: string, status: OrderStatus) => {
    await updateOrder(id, { status });
    showToast(t.savedSuccess);
  };

  return (
    <div className="app-container">
      {/* 1. Top Header with Desktop Navigation */}
      <Header
        lang={lang}
        onToggleLang={handleToggleLang}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Database Setup Banner (Visible when DATABASE_URL is not yet connected) */}
      {!isNeonConnected && !isLoading && (
        <div className="system-banner">
          <Info size={18} style={{ flexShrink: 0 }} />
          <div>
            <strong>{lang === 'hi' ? 'डिवाइस स्टोरेज:' : 'Device storage:'}</strong>{' '}
            {lang === 'hi'
              ? 'आपका डेटा इस डिवाइस पर सुरक्षित सेव हो रहा है।'
              : 'Your data is saved safely on this device.'}
          </div>
        </div>
      )}

      {toastMsg && (
        <div className="app-toast">
          <Check size={16} color="#6EE7B7" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 3. Main Views */}
      <main style={{ flex: 1 }}>
        {activeTab === 'dashboard' && (
          <DashboardView
            orders={orders}
            transactions={transactions}
            lang={lang}
            onOpenAddIncome={handleOpenAddIncome}
            onOpenAddExpense={handleOpenAddExpense}
            onOpenAddOrder={handleOpenAddOrder}
            onCollectPayment={handleCollectPayment}
            onSelectTab={tab => setActiveTab(tab)}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsView
            transactions={transactions}
            lang={lang}
            onOpenAddIncome={handleOpenAddIncome}
            onOpenAddExpense={handleOpenAddExpense}
            onEditTransaction={handleEditTx}
            onDeleteTransaction={handleDeleteTx}
          />
        )}

        {activeTab === 'orders' && (
          <OrdersView
            orders={orders}
            lang={lang}
            onOpenAddOrder={handleOpenAddOrder}
            onEditOrder={handleEditOrder}
            onDeleteOrder={handleDeleteOrder}
            onCollectPayment={handleCollectPayment}
            onUpdateStatus={handleUpdateOrderStatus}
          />
        )}
      </main>

      {/* 4. Mobile Bottom Navigation (Native iOS feel with safe area insets) */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        lang={lang}
      />

      {/* 5. Modals */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        defaultType={txDefaultType}
        initialData={editingTx}
        lang={lang}
        onSave={async txData => {
          if (editingTx) {
            await updateTransaction(editingTx.id, txData);
          } else {
            await addTransaction(txData);
          }
          showToast(t.savedSuccess);
        }}
      />

      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        initialData={editingOrder}
        lang={lang}
        onSave={async orderData => {
          if (editingOrder) {
            await updateOrder(editingOrder.id, orderData);
          } else {
            await addOrder(orderData);
          }
          showToast(t.savedSuccess);
        }}
        onSaveMany={async ordersData => {
          await addOrders(ordersData);
          showToast(t.savedSuccess);
        }}
      />

      <CollectPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        order={payingOrder}
        lang={lang}
        onConfirm={async (orderId, amount, date, note, markCompleted) => {
          await recordOrderPayment(orderId, amount, date, note, markCompleted);
          showToast(t.paymentSuccess);
        }}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        description={confirmModal.desc}
        lang={lang}
      />
    </div>
  );
}
