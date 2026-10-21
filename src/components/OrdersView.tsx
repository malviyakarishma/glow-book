'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Phone,
  MessageCircle,
  Plus,
  Download,
  Edit2,
  Trash2,
  CreditCard,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { Order, OrderStatus } from '@/lib/types';
import { Language, translations } from '@/lib/translations';
import { exportOrdersToCsv } from '@/lib/export';
import { DateFilterBar, DatePeriod } from '@/components/DateFilterBar';
import { isToday, isTomorrow, localToday } from '@/lib/dates';

interface OrdersViewProps {
  orders: Order[];
  lang: Language;
  onOpenAddOrder: () => void;
  onEditOrder: (order: Order) => void;
  onDeleteOrder: (id: string) => void;
  onCollectPayment: (order: Order) => void;
  onUpdateStatus: (id: string, status: OrderStatus) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  lang,
  onOpenAddOrder,
  onEditOrder,
  onDeleteOrder,
  onCollectPayment,
  onUpdateStatus,
}) => {
  const t = translations[lang];

  const [todayStr, setTodayStr] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [period, setPeriod] = useState<DatePeriod>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const now = localToday();
    setTodayStr(now);
    setSelectedDate(now);
  }, []);

  const currentMonthStr = todayStr ? todayStr.substring(0, 7) : '';
  const currentYearStr = todayStr ? todayStr.substring(0, 4) : '';

  const filtered = useMemo(() => {
    return orders
      .filter(o => {
        if (period === 'today' && o.appointment_date !== todayStr) return false;
        if (period === 'date' && o.appointment_date !== selectedDate) return false;
        if (period === 'month' && !o.appointment_date.startsWith(currentMonthStr)) return false;
        if (period === 'year' && !o.appointment_date.startsWith(currentYearStr)) return false;

        if (statusFilter !== 'all' && o.status !== statusFilter) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = o.customer_name.toLowerCase().includes(q);
          const matchPhone = o.phone_number?.toLowerCase().includes(q);
          const matchService = o.service_type.toLowerCase().includes(q);
          if (!matchName && !matchPhone && !matchService) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const byDate = a.appointment_date.localeCompare(b.appointment_date);
        if (byDate !== 0) return byDate;
        return (a.appointment_time || '').localeCompare(b.appointment_time || '');
      });
  }, [orders, period, selectedDate, statusFilter, searchQuery, todayStr, currentMonthStr, currentYearStr]);

  const totalBookedValue = useMemo(() => filtered.reduce((a, c) => a + Number(c.total_price), 0), [filtered]);
  const totalReceivedValue = useMemo(() => filtered.reduce((a, c) => a + Number(c.advance_amount), 0), [filtered]);
  const totalBalanceDue = useMemo(
    () => filtered.filter(o => o.status !== 'Cancelled').reduce((a, c) => a + Number(c.remaining_balance), 0),
    [filtered]
  );

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Upcoming':
        return <span className="badge-status upcoming">{t.statusUpcoming}</span>;
      case 'Completed':
        return <span className="badge-status completed">{t.statusCompleted}</span>;
      case 'Cancelled':
        return <span className="badge-status cancelled">{t.statusCancelled}</span>;
    }
  };

  const getDateLabel = (dateStr: string) => {
    if (isToday(dateStr, todayStr)) return lang === 'hi' ? 'आज' : 'Today';
    if (isTomorrow(dateStr, todayStr)) return lang === 'hi' ? 'कल' : 'Tomorrow';
    return dateStr;
  };

  return (
    <div className="main-content">
      <div className="page-toolbar">
        <h2 className="page-title">{t.orders}</h2>
        <div className="page-toolbar-actions">
          <button
            type="button"
            onClick={() => exportOrdersToCsv(filtered)}
            className="btn-contact"
            aria-label="Export CSV"
          >
            <Download size={16} />
            <span>CSV</span>
          </button>
          <button type="button" onClick={onOpenAddOrder} className="btn-primary-modal btn-compact">
            <Plus size={18} />
            <span>{t.addOrder}</span>
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
        resultCount={period === 'date' ? filtered.length : undefined}
      />

      <div className="filter-row">
        <div className="search-field">
          <Search size={18} className="search-field-icon" />
          <input
            type="search"
            placeholder={t.searchCustomer}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="form-input"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as 'all' | OrderStatus)}
          className="form-select"
          aria-label="Filter by order status"
        >
          <option value="all">{t.allStatuses}</option>
          <option value="Upcoming">{t.statusUpcoming}</option>
          <option value="Completed">{t.statusCompleted}</option>
          <option value="Cancelled">{t.statusCancelled}</option>
        </select>
      </div>

      <div className="stats-container">
        <div className="stat-card">
          <span className="stat-label">{t.totalPrice}</span>
          <span className="stat-value">₹{totalBookedValue.toLocaleString('en-IN')}</span>
        </div>
        <div className="stat-card income-card">
          <span className="stat-label">{lang === 'hi' ? 'प्राप्त एडवांस' : 'Received'}</span>
          <span className="stat-value income">₹{totalReceivedValue.toLocaleString('en-IN')}</span>
        </div>
        <div className="stat-card pending-card">
          <span className="stat-label">{t.pendingBalance}</span>
          <span className="stat-value pending">₹{totalBalanceDue.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon-wrap">
            <Calendar size={26} />
          </div>
          <div className="empty-title">
            {period === 'date'
              ? lang === 'hi'
                ? 'इस तारीख को कोई बुकिंग नहीं है'
                : 'No bookings for this date'
              : t.noOrdersFound}
          </div>
          <div className="empty-subtitle">{t.addFirstOrder}</div>
        </div>
      ) : (
        <div className="card-list">
          {filtered.map(order => {
            const highlight =
              order.status === 'Upcoming' &&
              (isToday(order.appointment_date, todayStr) || isTomorrow(order.appointment_date, todayStr));

            return (
              <div
                key={order.id}
                className={`order-card ${highlight ? 'order-card-highlight' : ''} ${
                  order.status === 'Completed' ? 'order-card-done' : ''
                }`}
              >
                <div className="order-card-top">
                  <div className="order-customer">
                    <div className="customer-name">{order.customer_name}</div>
                    <div className="service-title">{order.service_type}</div>
                  </div>
                  <div className="order-card-meta">
                    {getStatusBadge(order.status)}
                    <div className="appointment-badge">
                      <Clock size={12} />
                      <span>
                        {getDateLabel(order.appointment_date)}
                        {order.appointment_time ? ` · ${order.appointment_time}` : ''}
                      </span>
                    </div>
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
                      style={{ color: order.remaining_balance > 0 ? 'var(--pending-text)' : 'var(--income-text)' }}
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

                  <div className="order-actions-end">
                    {order.status === 'Upcoming' && (
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(order.id, 'Completed')}
                        className="icon-btn-ghost success"
                        title="Mark Completed"
                        aria-label="Mark Completed"
                      >
                        <CheckCircle2 size={18} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onEditOrder(order)}
                      className="icon-btn-ghost"
                      aria-label="Edit booking"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteOrder(order.id)}
                      className="icon-btn-ghost danger"
                      aria-label="Delete booking"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
