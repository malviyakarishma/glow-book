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
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { Order, OrderStatus } from '@/lib/types';
import { Language, translations } from '@/lib/translations';
import { exportOrdersToCsv } from '@/lib/export';

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

  const [todayStr, setTodayStr] = useState<string>('');

  useEffect(() => {
    setTodayStr(new Date().toISOString().split('T')[0]);
  }, []);

  const currentMonthStr = useMemo(() => (todayStr ? todayStr.substring(0, 7) : ''), [todayStr]);
  const currentYearStr = useMemo(() => (todayStr ? todayStr.substring(0, 4) : ''), [todayStr]);

  // Filters
  const [period, setPeriod] = useState<'all' | 'today' | 'month' | 'year'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filtered list
  const filtered = useMemo(() => {
    return orders
      .filter(o => {
        // Date filter
        if (period === 'today' && o.appointment_date !== todayStr) return false;
        if (period === 'month' && !o.appointment_date.startsWith(currentMonthStr)) return false;
        if (period === 'year' && !o.appointment_date.startsWith(currentYearStr)) return false;

        // Status filter
        if (statusFilter !== 'all' && o.status !== statusFilter) return false;

        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = o.customer_name.toLowerCase().includes(q);
          const matchPhone = o.phone_number?.toLowerCase().includes(q);
          const matchService = o.service_type.toLowerCase().includes(q);
          if (!matchName && !matchPhone && !matchService) return false;
        }

        return true;
      })
      .sort((a, b) => a.appointment_date.localeCompare(b.appointment_date));
  }, [orders, period, statusFilter, searchQuery, todayStr, currentMonthStr, currentYearStr]);

  // Totals for the current filtered view
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

  const getDateHighlight = (dateStr: string) => {
    if (dateStr === todayStr) return { label: lang === 'hi' ? 'आज (Today)' : 'Today', isToday: true };
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    if (dateStr === tomorrow) return { label: lang === 'hi' ? 'कल (Tomorrow)' : 'Tomorrow', isTomorrow: true };
    return { label: dateStr, isToday: false, isTomorrow: false };
  };

  return (
    <div className="main-content">
      {/* Top Header Row with Export and Add Booking Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)' }}>
          {t.orders}
        </h2>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => exportOrdersToCsv(filtered)}
            className="btn-contact"
            title="Download CSV report"
          >
            <Download size={16} />
            <span style={{ fontSize: '0.85rem' }}>{t.exportCsv}</span>
          </button>

          <button
            onClick={onOpenAddOrder}
            className="action-card-btn primary-rose"
            style={{ padding: '8px 16px', flexDirection: 'row', gap: '6px' }}
          >
            <Plus size={18} />
            <span style={{ fontSize: '0.9rem' }}>{t.addOrder}</span>
          </button>
        </div>
      </div>

      {/* Date Period Filter Pills */}
      <div className="filter-pill-bar">
        <button
          onClick={() => setPeriod('all')}
          className={`filter-pill ${period === 'all' ? 'active' : ''}`}
        >
          {t.filterAll}
        </button>
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
      </div>

      {/* Search and Status Dropdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
        <div style={{ position: 'relative' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            placeholder={t.searchCustomer}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '38px', fontSize: '0.92rem' }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as 'all' | OrderStatus)}
          className="form-select"
          style={{ fontSize: '0.9rem' }}
        >
          <option value="all">{t.allStatuses}</option>
          <option value="Upcoming">{t.statusUpcoming}</option>
          <option value="Completed">{t.statusCompleted}</option>
          <option value="Cancelled">{t.statusCancelled}</option>
        </select>
      </div>

      {/* Filtered Financial Snapshot Cards */}
      <div className="stats-container">
        <div className="stat-card">
          <span className="stat-label">{t.totalPrice}</span>
          <span className="stat-value" style={{ color: 'var(--text-main)' }}>
            ₹{totalBookedValue.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="stat-card income-card">
          <span className="stat-label">{lang === 'hi' ? 'प्राप्त रकम (Received)' : 'Total Received'}</span>
          <span className="stat-value income">
            ₹{totalReceivedValue.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="stat-card" style={{ borderLeft: '5px solid #C2410C' }}>
          <span className="stat-label">{t.pendingBalance}</span>
          <span className="stat-value" style={{ color: '#C2410C' }}>
            ₹{totalBalanceDue.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Orders List */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon-wrap">
            <Calendar size={28} />
          </div>
          <div className="empty-title">{t.noOrdersFound}</div>
          <div className="empty-subtitle">{t.addFirstOrder}</div>
        </div>
      ) : (
        <div className="card-list">
          {filtered.map(order => {
            const dateInfo = getDateHighlight(order.appointment_date);

            return (
              <div
                key={order.id}
                className="order-card"
                style={{
                  borderLeft:
                    order.status === 'Upcoming' && (dateInfo.isToday || dateInfo.isTomorrow)
                      ? '5px solid var(--rose-primary)'
                      : order.status === 'Completed'
                      ? '5px solid var(--completed-border)'
                      : '1.5px solid var(--rose-border-subtle)',
                }}
              >
                {/* Top: Customer + Status + Date */}
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

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    {getStatusBadge(order.status)}
                    <div className="appointment-badge" style={{ marginTop: '2px' }}>
                      <Clock size={13} />
                      <span>
                        {dateInfo.label}
                        {order.appointment_time ? ` • ${order.appointment_time}` : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Money Details */}
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

                {/* Actions Row */}
                <div className="order-actions">
                  {order.remaining_balance > 0 && order.status !== 'Cancelled' && (
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

                      <a href={`tel:${order.phone_number}`} className="btn-contact" title="Call">
                        <Phone size={15} />
                        <span>{t.callNow}</span>
                      </a>
                    </>
                  )}

                  <div style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
                    {/* Status quick toggle */}
                    {order.status === 'Upcoming' && (
                      <button
                        onClick={() => onUpdateStatus(order.id, 'Completed')}
                        className="icon-btn-ghost"
                        title="Mark Completed"
                        style={{ color: '#047857' }}
                      >
                        <CheckCircle2 size={18} />
                      </button>
                    )}

                    <button
                      onClick={() => onEditOrder(order)}
                      className="icon-btn-ghost"
                      title={t.edit}
                      aria-label="Edit booking"
                    >
                      <Edit2 size={16} />
                    </button>

                    <button
                      onClick={() => onDeleteOrder(order.id)}
                      className="icon-btn-ghost danger"
                      title={t.delete}
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
