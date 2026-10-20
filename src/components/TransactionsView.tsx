'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  Download,
  Edit2,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { Transaction, TransactionType } from '@/lib/types';
import { Language, translations, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/lib/translations';
import { exportTransactionsToCsv } from '@/lib/export';

interface TransactionsViewProps {
  transactions: Transaction[];
  lang: Language;
  onOpenAddIncome: () => void;
  onOpenAddExpense: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  lang,
  onOpenAddIncome,
  onOpenAddExpense,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  const t = translations[lang];

  const [todayStr, setTodayStr] = useState<string>('');
  const [period, setPeriod] = useState<'today' | 'month' | 'year' | 'all' | 'custom'>('month');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');

  useEffect(() => {
    const now = new Date().toISOString().split('T')[0];
    setTodayStr(now);
    setCustomStart(now);
    setCustomEnd(now);
  }, []);

  const currentMonthStr = useMemo(() => (todayStr ? todayStr.substring(0, 7) : ''), [todayStr]);
  const currentYearStr = useMemo(() => (todayStr ? todayStr.substring(0, 4) : ''), [todayStr]);
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filtered transactions
  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      // Date filter
      if (period === 'today' && tx.date !== todayStr) return false;
      if (period === 'month' && !tx.date.startsWith(currentMonthStr)) return false;
      if (period === 'year' && !tx.date.startsWith(currentYearStr)) return false;
      if (period === 'custom') {
        if (customStart && tx.date < customStart) return false;
        if (customEnd && tx.date > customEnd) return false;
      }

      // Type filter
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;

      // Category filter
      if (categoryFilter !== 'all' && tx.category !== categoryFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCategory = tx.category.toLowerCase().includes(q);
        const matchNote = tx.note?.toLowerCase().includes(q);
        if (!matchCategory && !matchNote) return false;
      }

      return true;
    });
  }, [
    transactions,
    period,
    todayStr,
    currentMonthStr,
    currentYearStr,
    customStart,
    customEnd,
    typeFilter,
    categoryFilter,
    searchQuery,
  ]);

  // Summaries
  const totalIncome = useMemo(() => {
    return filtered
      .filter(t => t.type === 'income')
      .reduce((acc, curr) => acc + Number(curr.amount), 0);
  }, [filtered]);

  const totalExpense = useMemo(() => {
    return filtered
      .filter(t => t.type === 'expense')
      .reduce((acc, curr) => acc + Number(curr.amount), 0);
  }, [filtered]);

  const netProfit = totalIncome - totalExpense;

  // Chart data: percentages
  const grandTotal = totalIncome + totalExpense;
  const incomePercent = grandTotal > 0 ? Math.round((totalIncome / grandTotal) * 100) : 50;
  const expensePercent = grandTotal > 0 ? 100 - incomePercent : 50;

  // Category breakdown
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, { type: TransactionType; amount: number }> = {};
    for (const tx of filtered) {
      if (!map[tx.category]) {
        map[tx.category] = { type: tx.type, amount: 0 };
      }
      map[tx.category].amount += Number(tx.amount);
    }
    return Object.entries(map).sort((a, b) => b[1].amount - a[1].amount).slice(0, 4);
  }, [filtered]);

  const allAvailableCategories = Array.from(
    new Set([...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES, ...transactions.map(t => t.category)])
  );

  return (
    <div className="main-content">
      {/* Top Header Row with Export and Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
          {t.incomeExpense}
        </h2>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => exportTransactionsToCsv(filtered)}
            className="btn-contact"
            title="Download CSV report"
            aria-label="Export CSV"
          >
            <Download size={16} />
            <span>CSV</span>
          </button>

          <button
            type="button"
            onClick={onOpenAddIncome}
            className="sub-action-btn income-btn"
            style={{ padding: '8px 14px', minHeight: '44px' }}
          >
            <span>+ {t.income}</span>
          </button>

          <button
            type="button"
            onClick={onOpenAddExpense}
            className="sub-action-btn expense-btn"
            style={{ padding: '8px 14px', minHeight: '44px' }}
          >
            <span>+ {t.expense}</span>
          </button>
        </div>
      </div>

      {/* Date Period Filter Pills */}
      <div className="filter-pill-bar" role="tablist" aria-label="Transaction date filters">
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
        <button
          type="button"
          onClick={() => setPeriod('custom')}
          className={`filter-pill ${period === 'custom' ? 'active' : ''}`}
          role="tab"
          aria-selected={period === 'custom'}
        >
          {t.filterCustom}
        </button>
      </div>

      {/* Custom Date Range Picker */}
      {period === 'custom' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            background: 'white',
            padding: '12px',
            borderRadius: '12px',
            border: '1px solid var(--rose-border)',
          }}
        >
          <div>
            <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)' }}>From</label>
            <input
              type="date"
              value={customStart}
              onChange={e => setCustomStart(e.target.value)}
              className="form-input"
              style={{ padding: '8px 10px', minHeight: '44px' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)' }}>To</label>
            <input
              type="date"
              value={customEnd}
              onChange={e => setCustomEnd(e.target.value)}
              className="form-input"
              style={{ padding: '8px 10px', minHeight: '44px' }}
            />
          </div>
        </div>
      )}

      {/* Totals Summary Cards */}
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

      {/* Visual Chart (Income vs Expense Ratio) */}
      <div className="chart-box">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {lang === 'hi' ? 'आय और खर्च का अनुपात (Income vs Expense)' : 'Income vs Expense Split'}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {filtered.length} {lang === 'hi' ? 'एंट्री' : 'entries'}
          </span>
        </div>

        <div className="progress-split" role="progressbar" aria-valuenow={incomePercent} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="progress-segment income"
            style={{ width: `${grandTotal > 0 ? incomePercent : 50}%` }}
            title={`Income: ${incomePercent}%`}
          />
          <div
            className="progress-segment expense"
            style={{ width: `${grandTotal > 0 ? expensePercent : 50}%` }}
            title={`Expense: ${expensePercent}%`}
          />
        </div>

        <div className="chart-legend">
          <div className="legend-item">
            <div className="legend-dot" style={{ background: 'var(--income-bar)' }} />
            <span style={{ color: 'var(--income-text)' }}>
              {t.income}: {grandTotal > 0 ? `${incomePercent}% (₹${totalIncome.toLocaleString('en-IN')})` : '0%'}
            </span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ background: 'var(--expense-bar)' }} />
            <span style={{ color: 'var(--expense-text)' }}>
              {t.expense}: {grandTotal > 0 ? `${expensePercent}% (₹${totalExpense.toLocaleString('en-IN')})` : '0%'}
            </span>
          </div>
        </div>

        {/* Top Category Mini-Meters */}
        {categoryBreakdown.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '8px', borderTop: '1px solid var(--rose-border-subtle)' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              {lang === 'hi' ? 'मुख्य केटेगरी (Top Categories)' : 'Top Categories'}
            </span>
            {categoryBreakdown.map(([cat, info]) => {
              const catPercent = grandTotal > 0 ? Math.round((info.amount / grandTotal) * 100) : 0;
              return (
                <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ fontWeight: 600 }}>{cat}</span>
                    <span style={{ fontWeight: 700, color: info.type === 'income' ? 'var(--income-text)' : 'var(--expense-text)' }}>
                      ₹{info.amount.toLocaleString('en-IN')} ({catPercent}%)
                    </span>
                  </div>
                  <div style={{ height: '6px', background: '#F3F4F6', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(100, Math.max(5, catPercent))}%`,
                        background: info.type === 'income' ? 'var(--income-bar)' : 'var(--expense-bar)',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Filter Row: Type + Category */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value as 'all' | 'income' | 'expense')}
          className="form-select"
          aria-label="Filter by transaction type"
        >
          <option value="all">{t.allTypes}</option>
          <option value="income">{t.incomeOnly}</option>
          <option value="expense">{t.expenseOnly}</option>
        </select>

        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="form-select"
          aria-label="Filter by transaction category"
        >
          <option value="all">{t.allCategories}</option>
          {allAvailableCategories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Transactions List */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon-wrap">
            <Sparkles size={26} />
          </div>
          <div className="empty-title">{t.noTransactionsFound}</div>
          <div className="empty-subtitle">{t.addFirstTx}</div>
        </div>
      ) : (
        <div className="card-list">
          {filtered.map(tx => (
            <div key={tx.id} className="tx-card">
              <div className="tx-card-left">
                <div className={`tx-icon-circle ${tx.type}`}>
                  {tx.type === 'income' ? <ArrowDownRight size={19} /> : <ArrowUpRight size={19} />}
                </div>

                <div className="tx-info">
                  <span className="tx-category">{tx.category}</span>
                  <span className="tx-date-note">
                    <span style={{ fontWeight: 600 }}>{tx.date}</span>
                    {tx.note && <span>• {tx.note}</span>}
                    {tx.order_id && (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          background: 'var(--bg-rose-tint)',
                          color: 'var(--rose-primary)',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontWeight: 700,
                        }}
                      >
                        Booking
                      </span>
                    )}
                    {tx.is_demo && (
                      <span
                        style={{
                          fontSize: '0.68rem',
                          background: '#F3F4F6',
                          color: '#6B7280',
                          padding: '1px 5px',
                          borderRadius: '4px',
                        }}
                      >
                        Demo
                      </span>
                    )}
                  </span>
                </div>
              </div>

              <div className="tx-card-right">
                <span className={`tx-amount ${tx.type}`}>
                  {tx.type === 'income' ? '+' : '-'} ₹{tx.amount.toLocaleString('en-IN')}
                </span>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => onEditTransaction(tx)}
                    className="icon-btn-ghost"
                    title={t.edit}
                    aria-label="Edit transaction"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteTransaction(tx.id)}
                    className="icon-btn-ghost danger"
                    title={t.delete}
                    aria-label="Delete transaction"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
