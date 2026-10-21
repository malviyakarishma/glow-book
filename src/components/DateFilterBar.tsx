'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Language, translations } from '@/lib/translations';
import { formatReadableDate, shiftDate } from '@/lib/dates';

export type DatePeriod = 'all' | 'today' | 'date' | 'month' | 'year' | 'custom';

interface DateFilterBarProps {
  lang: Language;
  period: DatePeriod;
  onPeriodChange: (period: DatePeriod) => void;
  selectedDate: string;
  onSelectedDateChange: (date: string) => void;
  todayStr: string;
  periods?: DatePeriod[];
  resultCount?: number;
  /** When clearing pick-date, which period to fall back to */
  clearToPeriod?: DatePeriod;
}

export const DateFilterBar: React.FC<DateFilterBarProps> = ({
  lang,
  period,
  onPeriodChange,
  selectedDate,
  onSelectedDateChange,
  todayStr,
  periods = ['all', 'today', 'date', 'month', 'year'],
  resultCount,
  clearToPeriod = 'all',
}) => {
  const t = translations[lang];
  const locale = lang === 'hi' ? 'hi-IN' : 'en-IN';

  const labels: Record<DatePeriod, string> = {
    all: t.filterAll,
    today: t.filterToday,
    date: t.filterPickDate,
    month: t.filterMonth,
    year: t.filterYear,
    custom: t.filterCustom,
  };

  const shift = (days: number) => {
    const base = selectedDate || todayStr;
    if (!base) return;
    onSelectedDateChange(shiftDate(base, days));
    onPeriodChange('date');
  };

  return (
    <>
      <div className="filter-pill-bar" role="tablist" aria-label="Date filters">
        {periods.map(p => (
          <button
            key={p}
            type="button"
            onClick={() => {
              onPeriodChange(p);
              if (p === 'date' && !selectedDate && todayStr) {
                onSelectedDateChange(todayStr);
              }
            }}
            className={`filter-pill ${period === p ? 'active' : ''}`}
            role="tab"
            aria-selected={period === p}
          >
            {labels[p]}
          </button>
        ))}
      </div>

      {period === 'date' && (
        <div className="date-picker-bar">
          <div className="date-picker-top">
            <span className="date-picker-label">{t.selectedDate}</span>
            <button
              type="button"
              onClick={() => onPeriodChange(clearToPeriod)}
              className="date-picker-clear"
            >
              <X size={14} />
              <span>{lang === 'hi' ? 'साफ़ करें' : 'Clear'}</span>
            </button>
          </div>

          <div className="date-picker-controls">
            <button
              type="button"
              onClick={() => shift(-1)}
              className="icon-btn-ghost"
              aria-label="Previous day"
            >
              <ChevronLeft size={20} />
            </button>

            <input
              type="date"
              value={selectedDate || todayStr}
              onChange={e => {
                if (e.target.value) {
                  onSelectedDateChange(e.target.value);
                  onPeriodChange('date');
                }
              }}
              className="form-input date-picker-input"
              aria-label="Pick date"
            />

            <button
              type="button"
              onClick={() => shift(1)}
              className="icon-btn-ghost"
              aria-label="Next day"
            >
              <ChevronRight size={20} />
            </button>

            {selectedDate !== todayStr && (
              <button
                type="button"
                onClick={() => {
                  onSelectedDateChange(todayStr);
                  onPeriodChange('date');
                }}
                className="btn-contact"
              >
                {t.filterToday}
              </button>
            )}
          </div>

          <div className="date-picker-meta">
            {formatReadableDate(selectedDate || todayStr, locale)}
            {typeof resultCount === 'number' && (
              <>
                {' · '}
                <strong>
                  {resultCount}{' '}
                  {lang === 'hi' ? 'रिकॉर्ड' : resultCount === 1 ? 'record' : 'records'}
                </strong>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
