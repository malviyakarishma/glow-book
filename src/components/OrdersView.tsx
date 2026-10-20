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
    if (dateStr === todayStr) return { label: lang === 'hi' ? 'आज' : 'Today', isToday: true };
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    if (dateStr === tomorrow) return { label: lang === 'hi' ? 'कल' : 'Tomorrow', isTomorrow: true };
    return { label: dateStr, isToday: false, isTomorrow: false };
  };

  return (
    <div className="main-content">
      {/* Top Header Row with Export and Add Booking Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
          {t.orders}
        </h2>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => exportOrdersToCsv(filtered)}
            className="btn-contact"
            title="Download CSV report"
            aria-label="Export CSV"
          >
            <Download size={16} />
            <span>CSV</span>
          </button>

          <button
            type="button"
            onClick={onOpenAddOrder}
            className="btn-primary-modal"
            style={{ padding: '8px 16px', minHeight: '44px' }}
          >
            <Plus size={18} />
            <span>{t.addOrder}</span>
          </button>
        </div>
      </div>

      {/* Date Period Filter Pills */}
      <div className="filter-pill-bar" role="tablist" aria-label="Order date filters">
        <button
          type="button"
          onClick={() => setPeriod('all')}
          className={`filter-pill ${period === 'all' ? 'active' : ''}`}
          role="tab"
          aria-selected={period === 'all'}
        >
          {t.filterAll}
        </button>
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
      </div>

      {/* Mobile-Friendly Search and Status Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              pointerEvents: 'none',
            }}
          />
          <input
            type="search"
            placeholder={t.searchCustomer}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '40px' }}
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

      {/* Financial Snapshot Cards */}
      <div className="stats-container">
        <div className="stat-card">
          <span className="stat-label">{t.totalPrice}</span>
          <span className="stat-value" style={{ color: 'var(--text-main)' }}>
            ₹{totalBookedValue.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="stat-card income-card">
          <span className="stat-label">{lang === 'hi' ? 'प्राप्त एडवांस (Received)' : 'Total Received'}</span>
          <span className="stat-value income">
            ₹{totalReceivedValue.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="stat-card" style={{ borderLeft: '4px solid var(--pending-text)' }}>
          <span className="stat-label">{t.pendingBalance}</span>
          <span className="stat-value" style={{ color: 'var(--pending-text)' }}>
            ₹{totalBalanceDue.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Orders List */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon-wrap">
            <Calendar size={26} />
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
                      ? '4px solid var(--rose-primary)'
                      : order.status === 'Completed'
                      ? '4px solid var(--completed-border)'
                      : '1px solid var(--rose-border)',
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

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    {getStatusBadge(order.status)}
                    <div className="appointment-badge">
                      <Clock size={12} />
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

                {/* Actions Row */}
                <div className="order-actions">
                  {order.remaining_balance > 0 && order.status !== 'Cancelled' && (
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

                      <a href={`tel:${order.phone_number}`} className="btn-contact" title="Call">
                        <Phone size={15} />
                        <span>{t.callNow}</span>
                      </a>
                    </>
                  )}

                  <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto' }}>
                    {order.status === 'Upcoming' && (
                      <button
                        type="button"
                        onClick={() => onUpdateStatus(order.id, 'Completed')}
                        className="icon-btn-ghost"
                        title="Mark Completed"
                        style={{ color: 'var(--completed-text)' }}
                        aria-label="Mark Completed"
                      >
                        <CheckCircle2 size={18} />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onEditOrder(order)}
                      className="icon-btn-ghost"
                      title={t.edit}
                      aria-label="Edit booking"
                    >
                      <Edit2 size={16} />
                    </button>

                    <button
                      type="button"
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
