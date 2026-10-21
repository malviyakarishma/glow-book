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
  ChevronRight,
  Clock,
} from 'lucide-react';
import { Order, Transaction } from '@/lib/types';
import { Language, translations } from '@/lib/translations';
import { DateFilterBar, DatePeriod } from '@/components/DateFilterBar';
import { formatReadableDate, isToday, isTomorrow, localToday } from '@/lib/dates';

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
  const locale = lang === 'hi' ? 'hi-IN' : 'en-IN';
  const [period, setPeriod] = useState<DatePeriod>('today');
  const [todayStr, setTodayStr] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    const now = localToday();
    setTodayStr(now);
    setSelectedDate(now);
  }, []);

  const currentMonthStr = todayStr ? todayStr.substring(0, 7) : '';
  const currentYearStr = todayStr ? todayStr.substring(0, 4) : '';

  const filteredTx = useMemo(() => {
    return transactions.filter(tx => {
      if (period === 'today') return tx.date === todayStr;
      if (period === 'date') return tx.date === selectedDate;
      if (period === 'month') return tx.date.startsWith(currentMonthStr);
      if (period === 'year') return tx.date.startsWith(currentYearStr);
      return true;
    });
  }, [transactions, period, todayStr, selectedDate, currentMonthStr, currentYearStr]);

  const totalIncome = useMemo(
    () => filteredTx.filter(tx => tx.type === 'income').reduce((acc, curr) => acc + Number(curr.amount), 0),
    [filteredTx]
  );
  const totalExpense = useMemo(
    () => filteredTx.filter(tx => tx.type === 'expense').reduce((acc, curr) => acc + Number(curr.amount), 0),
    [filteredTx]
  );
  const netProfit = totalIncome - totalExpense;

  const monthStats = useMemo(() => {
    const monthTx = transactions.filter(tx => tx.date.startsWith(currentMonthStr));
    const mIncome = monthTx.filter(t => t.type === 'income').reduce((a, c) => a + Number(c.amount), 0);
    const mExpense = monthTx.filter(t => t.type === 'expense').reduce((a, c) => a + Number(c.amount), 0);
    const pendingDue = orders
      .filter(o => o.status !== 'Cancelled')
      .reduce((a, c) => a + Number(c.remaining_balance), 0);
    return { income: mIncome, profit: mIncome - mExpense, pendingDue };
  }, [transactions, orders, currentMonthStr]);

  const relevantOrders = useMemo(() => {
    if (period === 'date') {
      return orders
        .filter(o => o.appointment_date === selectedDate)
        .sort((a, b) => (a.appointment_time || '').localeCompare(b.appointment_time || ''));
    }
    if (period === 'today') {
      return orders
        .filter(o => o.appointment_date === todayStr && o.status !== 'Cancelled')
        .sort((a, b) => (a.appointment_time || '').localeCompare(b.appointment_time || ''));
    }
    return orders
      .filter(o => o.status === 'Upcoming')
      .sort((a, b) => a.appointment_date.localeCompare(b.appointment_date))
      .slice(0, 5);
  }, [orders, period, selectedDate, todayStr]);

  const getDateLabel = (dateStr: string) => {
    if (isToday(dateStr, todayStr)) return lang === 'hi' ? 'आज' : 'Today';
    if (isTomorrow(dateStr, todayStr)) return lang === 'hi' ? 'कल' : 'Tomorrow';
    return dateStr;
  };

  const periodLabel =
    period === 'date'
      ? formatReadableDate(selectedDate, locale)
      : period === 'today'
      ? t.filterToday
      : period === 'month'
      ? t.filterMonth
      : period === 'year'
      ? t.filterYear
      : t.filterAll;

  return (
    <div className="main-content">
      <div className="action-section">
        <button type="button" onClick={onOpenAddOrder} className="hero-action-btn" aria-label={t.addOrder}>
          <div className="hero-btn-left">
            <div className="hero-btn-icon">
              <Plus size={22} strokeWidth={2.6} />
            </div>
            <div className="hero-btn-text">
              <h3>{t.addOrder}</h3>
              <p>
                {lang === 'hi'
                  ? 'ग्राहक, तारीख और समय दर्ज करें'
                  : 'Customer, dates, and times'}
              </p>
            </div>
          </div>
          <ChevronRight size={20} style={{ opacity: 0.8 }} />
        </button>

        <div className="sub-action-grid">
          <button type="button" onClick={onOpenAddIncome} className="sub-action-btn income-btn">
            <ArrowDownRight size={20} strokeWidth={2.4} />
            <span>{t.addIncome}</span>
          </button>
          <button type="button" onClick={onOpenAddExpense} className="sub-action-btn expense-btn">
            <ArrowUpRight size={20} strokeWidth={2.4} />
            <span>{t.addExpense}</span>
          </button>
        </div>
      </div>

      <DateFilterBar
        lang={lang}
        period={period}
        onPeriodChange={setPeriod}
        selectedDate={selectedDate}
        onSelectedDateChange={setSelectedDate}
        todayStr={todayStr}
        periods={['today', 'date', 'month', 'year', 'all']}
        clearToPeriod="today"
      />

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
            <span>{t.netProfit}</span>
          </div>
          <div className="stat-value profit">₹ {netProfit.toLocaleString('en-IN')}</div>
        </div>
      </div>

      <div className="highlight-banner">
        <div className="banner-content">
          <h4>{t.monthIncome}</h4>
          <p>
            {t.pendingBalance}:{' '}
            <strong className="text-pending">₹ {monthStats.pendingDue.toLocaleString('en-IN')}</strong>
          </p>
        </div>
        <div className="banner-badge">
          <div className="banner-badge-label">{t.monthProfit}</div>
          <div className="badge-val">₹ {monthStats.profit.toLocaleString('en-IN')}</div>
        </div>
      </div>

      <div>
        <div className="section-header">
          <h2 className="section-title">
            <Calendar size={18} />
            <span>
              {period === 'date' || period === 'today'
                ? `${periodLabel} (${relevantOrders.length})`
                : `${t.upcomingOrders} (${relevantOrders.length})`}
            </span>
          </h2>
          <button type="button" onClick={() => onSelectTab('orders')} className="section-action">
            <span>{lang === 'hi' ? 'सभी देखें' : 'View all'}</span>
            <ChevronRight size={16} />
          </button>
        </div>

        {relevantOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon-wrap">
              <Calendar size={26} />
            </div>
            <div className="empty-title">
              {period === 'date' || period === 'today'
                ? lang === 'hi'
                  ? 'इस तारीख को कोई बुकिंग नहीं है'
                  : 'No bookings for this date'
                : t.noUpcomingToday}
            </div>
            <div className="empty-subtitle">{t.addFirstOrder}</div>
          </div>
        ) : (
          <div className="card-list" style={{ marginTop: 8 }}>
            {relevantOrders.map(order => {
              const highlight =
                isToday(order.appointment_date, todayStr) || isTomorrow(order.appointment_date, todayStr);
              return (
                <div key={order.id} className={`order-card ${highlight ? 'order-card-highlight' : ''}`}>
                  <div className="order-card-top">
                    <div className="order-customer">
                      <div className="customer-name">{order.customer_name}</div>
                      <div className="service-title">{order.service_type}</div>
                    </div>
                    <div className="appointment-badge">
                      <Clock size={12} />
                      <span>
                        {getDateLabel(order.appointment_date)}
                        {order.appointment_time ? ` · ${order.appointment_time}` : ''}
                      </span>
                    </div>
                  </div>

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
                        style={{
                          color: order.remaining_balance > 0 ? 'var(--pending-text)' : 'var(--income-text)',
                        }}
                      >
                        ₹{order.remaining_balance.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {order.notes && <div className="order-notes">{order.notes}</div>}

                  <div className="order-actions">
                    {order.remaining_balance > 0 && order.status !== 'Cancelled' && (
                      <button
                        type="button"
                        onClick={() => onCollectPayment(order)}
                        className="btn-collect-payment"
                      >
                        <CreditCard size={15} />
                        <span>
                          {t.collectPayment} (₹{order.remaining_balance.toLocaleString('en-IN')})
                        </span>
                      </button>
                    )}
                    {order.phone_number && (
                      <>
                        <a
                          href={`https://wa.me/91${order.phone_number.replace(/\D/g, '')}?text=${encodeURIComponent(
                            lang === 'hi'
                              ? `नमस्ते ${order.customer_name} जी! आपकी ${order.service_type} की बुकिंग ${order.appointment_date} को है।`
                              : `Hello ${order.customer_name}, confirming your appointment for ${order.service_type} on ${order.appointment_date}.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-contact whatsapp"
                        >
                          <MessageCircle size={15} />
                          <span>WhatsApp</span>
                        </a>
                        <a href={`tel:${order.phone_number}`} className="btn-contact">
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

      <div>
        <div className="section-header">
          <h2 className="section-title">
            <ArrowDownRight size={18} />
            <span>
              {periodLabel} · {filteredTx.length}{' '}
              {lang === 'hi' ? 'लेन-देन' : 'txns'}
            </span>
          </h2>
          <button type="button" onClick={() => onSelectTab('transactions')} className="section-action">
            <span>{lang === 'hi' ? 'सभी देखें' : 'View all'}</span>
            <ChevronRight size={16} />
          </button>
        </div>

        {filteredTx.length === 0 ? (
          <div className="empty-state">
            <div className="empty-title">{t.noTransactionsFound}</div>
            <div className="empty-subtitle">{t.addFirstTx}</div>
          </div>
        ) : (
          <div className="card-list" style={{ marginTop: 8 }}>
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
                      {tx.note && <span>· {tx.note}</span>}
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
