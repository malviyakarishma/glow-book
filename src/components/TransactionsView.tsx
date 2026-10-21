'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Download,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Transaction, TransactionType } from '@/lib/types';
import { Language, translations, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/lib/translations';
import { exportTransactionsToCsv } from '@/lib/export';
import { DateFilterBar, DatePeriod } from '@/components/DateFilterBar';
import { localToday } from '@/lib/dates';

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

  const [todayStr, setTodayStr] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [period, setPeriod] = useState<DatePeriod>('month');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    const now = localToday();
    setTodayStr(now);
    setSelectedDate(now);
    setCustomStart(now);
    setCustomEnd(now);
  }, []);

  const currentMonthStr = todayStr ? todayStr.substring(0, 7) : '';
  const currentYearStr = todayStr ? todayStr.substring(0, 4) : '';

  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      if (period === 'today' && tx.date !== todayStr) return false;
      if (period === 'date' && tx.date !== selectedDate) return false;
      if (period === 'month' && !tx.date.startsWith(currentMonthStr)) return false;
      if (period === 'year' && !tx.date.startsWith(currentYearStr)) return false;
      if (period === 'custom') {
        if (customStart && tx.date < customStart) return false;
        if (customEnd && tx.date > customEnd) return false;
      }

      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
      if (categoryFilter !== 'all' && tx.category !== categoryFilter) return false;

      return true;
    });
  }, [
    transactions,
    period,
    todayStr,
    selectedDate,
    currentMonthStr,
    currentYearStr,
    customStart,
    customEnd,
    typeFilter,
    categoryFilter,
  ]);

  const totalIncome = useMemo(
    () => filtered.filter(t => t.type === 'income').reduce((acc, curr) => acc + Number(curr.amount), 0),
    [filtered]
  );
  const totalExpense = useMemo(
    () => filtered.filter(t => t.type === 'expense').reduce((acc, curr) => acc + Number(curr.amount), 0),
    [filtered]
  );
  const netProfit = totalIncome - totalExpense;
  const grandTotal = totalIncome + totalExpense;
  const incomePercent = grandTotal > 0 ? Math.round((totalIncome / grandTotal) * 100) : 50;
  const expensePercent = grandTotal > 0 ? 100 - incomePercent : 50;

  const categoryBreakdown = useMemo(() => {
    const map: Record<string, { type: TransactionType; amount: number }> = {};
    for (const tx of filtered) {
      if (!map[tx.category]) map[tx.category] = { type: tx.type, amount: 0 };
      map[tx.category].amount += Number(tx.amount);
    }
    return Object.entries(map)
      .sort((a, b) => b[1].amount - a[1].amount)
      .slice(0, 4);
  }, [filtered]);

  const allAvailableCategories = Array.from(
    new Set([...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES, ...transactions.map(t => t.category)])
  );

  return (
    <div className="main-content">
      <div className="page-toolbar">
        <h2 className="page-title">{t.incomeExpense}</h2>
        <div className="page-toolbar-actions">
          <button
            type="button"
            onClick={() => exportTransactionsToCsv(filtered)}
            className="btn-contact"
            aria-label="Export CSV"
          >
            <Download size={16} />
            <span>CSV</span>
          </button>
          <button type="button" onClick={onOpenAddIncome} className="sub-action-btn income-btn btn-compact">
            <span>+ {t.income}</span>
          </button>
          <button type="button" onClick={onOpenAddExpense} className="sub-action-btn expense-btn btn-compact">
            <span>+ {t.expense}</span>
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
        periods={['today', 'date', 'month', 'year', 'all', 'custom']}
        resultCount={period === 'date' ? filtered.length : undefined}
        clearToPeriod="month"
      />

      {period === 'custom' && (
        <div className="date-range-bar">
          <div className="form-group">
            <label className="form-label-sub">{lang === 'hi' ? 'शुरू' : 'From'}</label>
            <input
              type="date"
              value={customStart}
              onChange={e => setCustomStart(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label-sub">{lang === 'hi' ? 'अंत' : 'To'}</label>
            <input
              type="date"
              value={customEnd}
              onChange={e => setCustomEnd(e.target.value)}
              className="form-input"
            />
          </div>
        </div>
      )}

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

      <div className="chart-box">
        <div className="chart-box-header">
          <span className="chart-box-title">
            {lang === 'hi' ? 'आय बनाम खर्च' : 'Income vs Expense'}
          </span>
          <span className="chart-box-meta">
            {filtered.length} {lang === 'hi' ? 'एंट्री' : 'entries'}
          </span>
        </div>

        <div className="progress-split" role="progressbar" aria-valuenow={incomePercent}>
          <div
            className="progress-segment income"
            style={{ width: `${grandTotal > 0 ? incomePercent : 50}%` }}
          />
          <div
            className="progress-segment expense"
            style={{ width: `${grandTotal > 0 ? expensePercent : 50}%` }}
          />
        </div>

        <div className="chart-legend">
          <div className="legend-item">
            <div className="legend-dot" style={{ background: 'var(--income-bar)' }} />
            <span style={{ color: 'var(--income-text)' }}>
              {t.income}: {grandTotal > 0 ? `${incomePercent}%` : '0%'}
            </span>
          </div>
          <div className="legend-item">
            <div className="legend-dot" style={{ background: 'var(--expense-bar)' }} />
            <span style={{ color: 'var(--expense-text)' }}>
              {t.expense}: {grandTotal > 0 ? `${expensePercent}%` : '0%'}
            </span>
          </div>
        </div>

        {categoryBreakdown.length > 0 && (
          <div className="category-breakdown">
            <span className="form-label-sub">
              {lang === 'hi' ? 'मुख्य केटेगरी' : 'Top categories'}
            </span>
            {categoryBreakdown.map(([cat, info]) => {
              const catPercent = grandTotal > 0 ? Math.round((info.amount / grandTotal) * 100) : 0;
              return (
                <div key={cat} className="category-row">
                  <div className="category-row-top">
                    <span>{cat}</span>
                    <span style={{ color: info.type === 'income' ? 'var(--income-text)' : 'var(--expense-text)' }}>
                      ₹{info.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="category-bar-track">
                    <div
                      className="category-bar-fill"
                      style={{
                        width: `${Math.min(100, Math.max(4, catPercent))}%`,
                        background: info.type === 'income' ? 'var(--income-bar)' : 'var(--expense-bar)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="filter-row">
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value as 'all' | 'income' | 'expense')}
          className="form-select"
        >
          <option value="all">{t.allTypes}</option>
          <option value="income">{t.incomeOnly}</option>
          <option value="expense">{t.expenseOnly}</option>
        </select>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="form-select"
        >
          <option value="all">{t.allCategories}</option>
          {allAvailableCategories.map(c => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
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
                    <span>{tx.date}</span>
                    {tx.note && <span>· {tx.note}</span>}
                    {tx.order_id && <span className="booking-chip">Booking</span>}
                  </span>
                </div>
              </div>
              <div className="tx-card-right">
                <span className={`tx-amount ${tx.type}`}>
                  {tx.type === 'income' ? '+' : '-'} ₹{tx.amount.toLocaleString('en-IN')}
                </span>
                <div className="order-actions-end">
                  <button
                    type="button"
                    onClick={() => onEditTransaction(tx)}
                    className="icon-btn-ghost"
                    aria-label="Edit transaction"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteTransaction(tx.id)}
                    className="icon-btn-ghost danger"
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
