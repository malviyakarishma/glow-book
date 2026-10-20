'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  Phone,
  MessageCircle,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Sparkles,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { Order, Transaction } from '@/lib/types';
import { Language, translations } from '@/lib/translations';

interface DashboardViewProps {
  orders: Order[];
  transactions: Transaction[];
  lang: Language;
  onOpenAddIncome: () => void;
  onOpenAddExpense: () => void;
  onOpenAddOrder: () => void;
  onCollectPayment: (order: Order) => void;
  onSelectTab: (tab: 'dashboard' | 'transactions' | 'orders') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  orders,
  transactions,
  lang,
  onOpenAddIncome,
  onOpenAddExpense,
  onOpenAddOrder,
  onCollectPayment,
  onSelectTab,
}) => {
  const t = translations[lang];
  const [period, setPeriod] = useState<'today' | 'month' | 'year' | 'all'>('today');
  const [todayStr, setTodayStr] = useState<string>('');

  useEffect(() => {
    setTodayStr(new Date().toISOString().split('T')[0]);
  }, []);

  const currentMonthStr = useMemo(() => (todayStr ? todayStr.substring(0, 7) : ''), [todayStr]);
  const currentYearStr = useMemo(() => (todayStr ? todayStr.substring(0, 4) : ''), [todayStr]);

  // Filter transactions based on selected dashboard period
  const filteredTx = useMemo(() => {
    return transactions.filter(tx => {
      if (period === 'today') return tx.date === todayStr;
      if (period === 'month') return tx.date.startsWith(currentMonthStr);
      if (period === 'year') return tx.date.startsWith(currentYearStr);
      return true;
    });
  }, [transactions, period, todayStr, currentMonthStr, currentYearStr]);

  // Financial Stats for selected period
  const totalIncome = useMemo(() => {
    return filteredTx
      .filter(tx => tx.type === 'income')
      .reduce((acc, curr) => acc + Number(curr.amount), 0);
  }, [filteredTx]);

  const totalExpense = useMemo(() => {
    return filteredTx
      .filter(tx => tx.type === 'expense')
      .reduce((acc, curr) => acc + Number(curr.amount), 0);
  }, [filteredTx]);

  const netProfit = totalIncome - totalExpense;

  // Monthly stats for the banner
  const monthStats = useMemo(() => {
    const monthTx = transactions.filter(tx => tx.date.startsWith(currentMonthStr));
    const mIncome = monthTx.filter(t => t.type === 'income').reduce((a, c) => a + Number(c.amount), 0);
    const mExpense = monthTx.filter(t => t.type === 'expense').reduce((a, c) => a + Number(c.amount), 0);
    const pendingDue = orders
      .filter(o => o.status !== 'Cancelled')
      .reduce((a, c) => a + Number(c.remaining_balance), 0);
    return {
      income: mIncome,
      profit: mIncome - mExpense,
      pendingDue,
    };
  }, [transactions, orders, currentMonthStr]);

  // Upcoming Orders (Upcoming status, sorted by appointment date)
  const upcomingOrders = useMemo(() => {
    return orders
      .filter(o => o.status === 'Upcoming')
      .sort((a, b) => a.appointment_date.localeCompare(b.appointment_date))
      .slice(0, 5);
  }, [orders]);

  const getDateLabel = (dateStr: string) => {
    if (dateStr === todayStr) return lang === 'hi' ? 'आज' : 'Today';
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    if (dateStr === tomorrow) return lang === 'hi' ? 'कल' : 'Tomorrow';
    return dateStr;
  };

  return (
    <div className="main-content">
      {/* 1. Ergonomic Action Buttons (Hero New Booking + Side-by-Side Income/Expense) */}
      <div className="action-section">
        <button
          type="button"
          onClick={onOpenAddOrder}
          className="hero-action-btn"
          aria-label={t.addOrder}
        >
          <div className="hero-btn-left">
            <div className="hero-btn-icon">
              <Plus size={22} strokeWidth={2.6} />
            </div>
            <div className="hero-btn-text">
              <h3>{t.addOrder}</h3>
              <p>{lang === 'hi' ? 'नई ग्राहक बुकिंग व एडवांस दर्ज करें' : 'Schedule appointment & record advance'}</p>
            </div>
          </div>
          <ChevronRight size={20} style={{ opacity: 0.8 }} />
        </button>

        <div className="sub-action-grid">
          <button
            type="button"
            onClick={onOpenAddIncome}
            className="sub-action-btn income-btn"
          >
            <ArrowDownRight size={20} strokeWidth={2.4} />
            <span>{t.addIncome}</span>
          </button>

          <button
            type="button"
            onClick={onOpenAddExpense}
            className="sub-action-btn expense-btn"
          >
            <ArrowUpRight size={20} strokeWidth={2.4} />
            <span>{t.addExpense}</span>
          </button>
        </div>
      </div>

      {/* 2. Date Filter Pills */}
      <div className="filter-pill-bar" role="tablist" aria-label="Date range filters">
        <button
          type="button"
          onClick={() => setPeriod('today')}
          className={`filter-pill ${period === 'today' ? 'active' : ''}`}
          role="tab"
          aria-selected={period === 'today'}
        >
          {t.filterToday}
        </button>
        <button
          type="button"
          onClick={() => setPeriod('month')}
          className={`filter-pill ${period === 'month' ? 'active' : ''}`}
          role="tab"
          aria-selected={period === 'month'}
        >
          {t.filterMonth}
        </button>
        <button
          type="button"
          onClick={() => setPeriod('year')}
          className={`filter-pill ${period === 'year' ? 'active' : ''}`}
          role="tab"
          aria-selected={period === 'year'}
        >
          {t.filterYear}
        </button>
        <button
          type="button"
          onClick={() => setPeriod('all')}
          className={`filter-pill ${period === 'all' ? 'active' : ''}`}
          role="tab"
          aria-selected={period === 'all'}
        >
          {t.filterAll}
        </button>
      </div>

      {/* 3. Core Stats Cards */}
      <div className="stats-container">
        <div className="stat-card income-card">
          <div className="stat-label">
            <ArrowDownRight size={15} color="var(--income-text)" />
            <span>{t.totalIncome}</span>
          </div>
          <div className="stat-value income">₹ {totalIncome.toLocaleString('en-IN')}</div>
        </div>

        <div className="stat-card expense-card">
          <div className="stat-label">
            <ArrowUpRight size={15} color="var(--expense-text)" />
            <span>{t.totalExpense}</span>
          </div>
          <div className="stat-value expense">₹ {totalExpense.toLocaleString('en-IN')}</div>
        </div>

        <div className="stat-card profit-card">
          <div className="stat-label">
            <Sparkles size={15} color="var(--rose-primary)" />
            <span>{t.netProfit}</span>
          </div>
          <div className="stat-value profit">₹ {netProfit.toLocaleString('en-IN')}</div>
        </div>
      </div>

      {/* 4. Month Overview Highlight Banner */}
      <div className="highlight-banner">
        <div className="banner-content">
          <h4>{t.monthIncome}</h4>
          <p>
            {t.pendingBalance}: <strong style={{ color: 'var(--pending-text)' }}>₹ {monthStats.pendingDue.toLocaleString('en-IN')}</strong>
          </p>
        </div>
        <div className="banner-badge">
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)' }}>{t.monthProfit}</div>
          <div className="badge-val">₹ {monthStats.profit.toLocaleString('en-IN')}</div>
        </div>
      </div>

      {/* 5. Upcoming Appointments Section */}
      <div>
        <div className="section-header">
          <h2 className="section-title">
            <Calendar size={19} color="var(--rose-primary)" />
            <span>{t.upcomingOrders} ({upcomingOrders.length})</span>
          </h2>
          <button
            type="button"
            onClick={() => onSelectTab('orders')}
            className="section-action"
          >
            <span>{lang === 'hi' ? 'सभी देखें' : 'View all'}</span>
            <ChevronRight size={16} />
          </button>
        </div>

        {upcomingOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon-wrap">
              <Calendar size={26} />
            </div>
            <div className="empty-title">{t.noUpcomingToday}</div>
            <div className="empty-subtitle">{t.addFirstOrder}</div>
          </div>
        ) : (
          <div className="card-list" style={{ marginTop: '8px' }}>
            {upcomingOrders.map(order => {
              const isTodayOrTomorrow =
                order.appointment_date === todayStr ||
                order.appointment_date === new Date(Date.now() + 86400000).toISOString().split('T')[0];

              return (
                <div
                  key={order.id}
                  className="order-card"
                  style={{
                    borderLeft: isTodayOrTomorrow
                      ? '4px solid var(--rose-primary)'
                      : '1px solid var(--rose-border)',
                  }}
                >
                  <div className="order-card-top">
                    <div className="order-customer">
                      <div className="customer-name">
                        <span>{order.customer_name}</span>
                        {order.is_demo && (
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              background: '#F3F4F6',
                              color: '#6B7280',
                              padding: '2px 6px',
                              borderRadius: '4px',
                            }}
                          >
                            Demo
                          </span>
                        )}
                      </div>
                      <div className="service-title">{order.service_type}</div>
                    </div>

                    <div className="appointment-badge">
                      <Clock size={12} />
                      <span>
                        {getDateLabel(order.appointment_date)}
                        {order.appointment_time ? ` • ${order.appointment_time}` : ''}
                      </span>
                    </div>
                  </div>

                  {/* Financial Snapshot */}
                  <div className="order-money-grid">
                    <div className="money-box">
                      <span className="money-label">{t.totalPrice}</span>
                      <span className="money-amount total">₹{order.total_price.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="money-box">
                      <span className="money-label">{t.advanceAmount}</span>
                      <span className="money-amount received">₹{order.advance_amount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="money-box">
                      <span className="money-label">{t.balanceDue}</span>
                      <span
                        className="money-amount due"
                        style={{ color: order.remaining_balance > 0 ? 'var(--pending-text)' : 'var(--income-text)' }}
                      >
                        ₹{order.remaining_balance.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {order.notes && (
                    <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      "{order.notes}"
                    </div>
                  )}

                  {/* Quick Action Buttons */}
                  <div className="order-actions">
                    {order.remaining_balance > 0 && (
                      <button
                        type="button"
                        onClick={() => onCollectPayment(order)}
                        className="btn-collect-payment"
                      >
                        <CreditCard size={15} />
                        <span>{t.collectPayment} (₹{order.remaining_balance.toLocaleString('en-IN')})</span>
                      </button>
                    )}

                    {order.phone_number && (
                      <>
                        <a
                          href={`https://wa.me/91${order.phone_number.replace(/\D/g, '')}?text=${encodeURIComponent(
                            lang === 'hi'
                              ? `नमस्ते ${order.customer_name} जी! आपकी ${order.service_type} की बुकिंग ${order.appointment_date} को है। GlowBook से संदेश।`
                              : `Hello ${order.customer_name}, confirming your appointment for ${order.service_type} on ${order.appointment_date}.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-contact whatsapp"
                          title="WhatsApp"
                        >
                          <MessageCircle size={15} />
                          <span>WhatsApp</span>
                        </a>

                        <a
                          href={`tel:${order.phone_number}`}
                          className="btn-contact"
                          title="Call"
                        >
                          <Phone size={15} />
                          <span>{t.callNow}</span>
                        </a>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Transactions Quick Preview */}
      <div>
        <div className="section-header">
          <h2 className="section-title">
            <ArrowDownRight size={19} color="var(--income-text)" />
            <span>
              {period === 'today' ? t.todayIncome : t.totalIncome} / {t.totalExpense}
            </span>
          </h2>
          <button
            type="button"
            onClick={() => onSelectTab('transactions')}
            className="section-action"
          >
            <span>{lang === 'hi' ? 'सभी देखें' : 'View all'}</span>
            <ChevronRight size={16} />
          </button>
        </div>

        {filteredTx.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon-wrap">
              <Sparkles size={26} />
            </div>
            <div className="empty-title">{t.noTransactionsFound}</div>
            <div className="empty-subtitle">{t.addFirstTx}</div>
          </div>
        ) : (
          <div className="card-list" style={{ marginTop: '8px' }}>
            {filteredTx.slice(0, 4).map(tx => (
              <div key={tx.id} className="tx-card">
                <div className="tx-card-left">
                  <div className={`tx-icon-circle ${tx.type}`}>
                    {tx.type === 'income' ? <ArrowDownRight size={19} /> : <ArrowUpRight size={19} />}
                  </div>
                  <div className="tx-info">
                    <span className="tx-category">{tx.category}</span>
                    <span className="tx-date-note">
                      <span>{tx.date}</span>
                      {tx.note && <span>• {tx.note}</span>}
                    </span>
                  </div>
                </div>

                <div className="tx-card-right">
                  <span className={`tx-amount ${tx.type}`}>
                    {tx.type === 'income' ? '+' : '-'} ₹{tx.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
