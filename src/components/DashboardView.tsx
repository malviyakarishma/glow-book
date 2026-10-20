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
  CheckCircle,
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

  const currentMonthStr = useMemo(() => todayStr ? todayStr.substring(0, 7) : '', [todayStr]);
  const currentYearStr = useMemo(() => todayStr ? todayStr.substring(0, 4) : '', [todayStr]);

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
      .slice(0, 5); // Show top 5 upcoming
  }, [orders]);

  // Date badge helper ("Today", "Tomorrow", or date)
  const getDateLabel = (dateStr: string) => {
    if (dateStr === todayStr) return lang === 'hi' ? 'आज' : 'Today';
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    if (dateStr === tomorrow) return lang === 'hi' ? 'कल' : 'Tomorrow';
    return dateStr;
  };

  return (
    <div className="main-content">
      {/* 1. Quick Actions Row (Large, Touch-Friendly Buttons) */}
      <div className="action-grid">
        <button onClick={onOpenAddOrder} className="action-card-btn primary-rose">
          <div className="action-icon-circle">
            <Plus size={24} strokeWidth={2.6} />
          </div>
          <span>{t.addOrder}</span>
        </button>

        <button onClick={onOpenAddIncome} className="action-card-btn income-btn">
          <div className="action-icon-circle">
            <ArrowDownRight size={24} strokeWidth={2.4} />
          </div>
          <span>{t.addIncome}</span>
        </button>

        <button onClick={onOpenAddExpense} className="action-card-btn expense-btn">
          <div className="action-icon-circle">
            <ArrowUpRight size={24} strokeWidth={2.4} />
          </div>
          <span>{t.addExpense}</span>
        </button>
      </div>

      {/* 2. Date Filter Pills */}
      <div className="filter-pill-bar">
        <button
          onClick={() => setPeriod('today')}
          className={`filter-pill ${period === 'today' ? 'active' : ''}`}
        >
          {t.filterToday}
        </button>
        <button
          onClick={() => setPeriod('month')}
          className={`filter-pill ${period === 'month' ? 'active' : ''}`}
        >
          {t.filterMonth}
        </button>
        <button
          onClick={() => setPeriod('year')}
          className={`filter-pill ${period === 'year' ? 'active' : ''}`}
        >
          {t.filterYear}
        </button>
        <button
          onClick={() => setPeriod('all')}
          className={`filter-pill ${period === 'all' ? 'active' : ''}`}
        >
          {t.filterAll}
        </button>
      </div>

      {/* 3. Core Stats Cards */}
      <div className="stats-container">
        <div className="stat-card income-card">
          <div className="stat-label">
            <ArrowDownRight size={16} color="var(--income-text)" />
            <span>{t.totalIncome}</span>
          </div>
          <div className="stat-value income">₹ {totalIncome.toLocaleString('en-IN')}</div>
        </div>

        <div className="stat-card expense-card">
          <div className="stat-label">
            <ArrowUpRight size={16} color="var(--expense-text)" />
            <span>{t.totalExpense}</span>
          </div>
          <div className="stat-value expense">₹ {totalExpense.toLocaleString('en-IN')}</div>
        </div>

        <div className="stat-card profit-card">
          <div className="stat-label">
            <Sparkles size={16} color="var(--rose-primary)" />
            <span>{t.netProfit}</span>
          </div>
          <div className="stat-value profit">₹ {netProfit.toLocaleString('en-IN')}</div>
        </div>
      </div>

      {/* 4. Month Overview Highlight Banner */}
      <div className="highlight-banner">
        <div className="banner-content">
          <h4>{t.monthIncome}</h4>
          <p>{t.pendingBalance}: <strong style={{ color: '#C2410C' }}>₹ {monthStats.pendingDue.toLocaleString('en-IN')}</strong></p>
        </div>
        <div className="banner-badge">
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>{t.monthProfit}</div>
          <div className="badge-val">₹ {monthStats.profit.toLocaleString('en-IN')}</div>
        </div>
      </div>

      {/* 5. Upcoming Appointments Section */}
      <div>
        <div className="section-header">
          <h3 className="section-title">
            <Calendar size={20} color="var(--rose-primary)" />
            <span>{t.upcomingOrders} ({upcomingOrders.length})</span>
          </h3>
          <button
            onClick={() => onSelectTab('orders')}
            className="section-action"
            style={{ display: 'flex', alignItems: 'center', gap: '3px' }}
          >
            <span>{lang === 'hi' ? 'सभी देखें' : 'View all'}</span>
            <ChevronRight size={16} />
          </button>
        </div>

        {upcomingOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon-wrap">
              <Calendar size={28} />
            </div>
            <div className="empty-title">{t.noUpcomingToday}</div>
            <div className="empty-subtitle">{t.addFirstOrder}</div>
          </div>
        ) : (
          <div className="card-list" style={{ marginTop: '10px' }}>
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
                      ? '5px solid var(--rose-primary)'
                      : '1.5px solid var(--rose-border-subtle)',
                  }}
                >
                  <div className="order-card-top">
                    <div className="order-customer">
                      <div className="customer-name">
                        <span>{order.customer_name}</span>
                        {order.is_demo && (
                          <span
                            style={{
                              fontSize: '0.7rem',
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
                      <Clock size={13} />
                      <span>
                        {getDateLabel(order.appointment_date)}
                        {order.appointment_time ? ` • ${order.appointment_time}` : ''}
                      </span>
                    </div>
                  </div>

                  {/* Financial snapshot */}
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
                        style={{ color: order.remaining_balance > 0 ? '#C2410C' : '#047857' }}
                      >
                        ₹{order.remaining_balance.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {order.notes && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      "{order.notes}"
                    </div>
                  )}

                  {/* Quick Action Buttons */}
                  <div className="order-actions">
                    {order.remaining_balance > 0 && (
                      <button
                        onClick={() => onCollectPayment(order)}
                        className="btn-collect-payment"
                      >
                        <CreditCard size={16} />
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

      {/* 6. Today's Transactions Quick Preview */}
      <div>
        <div className="section-header">
          <h3 className="section-title">
            <ArrowDownRight size={20} color="var(--income-text)" />
            <span>
              {period === 'today' ? t.todayIncome : t.totalIncome} / {t.totalExpense}
            </span>
          </h3>
          <button
            onClick={() => onSelectTab('transactions')}
            className="section-action"
            style={{ display: 'flex', alignItems: 'center', gap: '3px' }}
          >
            <span>{lang === 'hi' ? 'सभी देखें' : 'View all'}</span>
            <ChevronRight size={16} />
          </button>
        </div>

        {filteredTx.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon-wrap">
              <Sparkles size={28} />
            </div>
            <div className="empty-title">{t.noTransactionsFound}</div>
            <div className="empty-subtitle">{t.addFirstTx}</div>
          </div>
        ) : (
          <div className="card-list" style={{ marginTop: '10px' }}>
            {filteredTx.slice(0, 4).map(tx => (
              <div key={tx.id} className="tx-card">
                <div className="tx-card-left">
                  <div className={`tx-icon-circle ${tx.type}`}>
                    {tx.type === 'income' ? <ArrowDownRight size={20} /> : <ArrowUpRight size={20} />}
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
