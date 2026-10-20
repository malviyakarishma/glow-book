'use client';

import React, { useState, useEffect } from 'react';
import { X, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Transaction, TransactionType } from '@/lib/types';
import { Language, translations, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/lib/translations';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  initialData?: Transaction | null;
  defaultType?: TransactionType;
  lang: Language;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  defaultType = 'income',
  lang,
}) => {
  const t = translations[lang];

  const [type, setType] = useState<TransactionType>(defaultType);
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setAmount(String(initialData.amount));
      setCategory(initialData.category);
      setDate(initialData.date);
      setNote(initialData.note || '');
    } else {
      setType(defaultType);
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setCategory(defaultType === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
      setNote('');
    }
    setErrorMsg('');
  }, [initialData, defaultType, isOpen]);

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'income') {
      setCategory(INCOME_CATEGORIES[0]);
    } else {
      setCategory(EXPENSE_CATEGORIES[0]);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg(lang === 'hi' ? 'कृपया सही रकम डालें (0 से अधिक)' : 'Please enter a valid amount greater than 0');
      return;
    }
    if (!category.trim()) {
      setErrorMsg(lang === 'hi' ? 'कृपया केटेगरी चुनें' : 'Please select a category');
      return;
    }
    if (!date) {
      setErrorMsg(lang === 'hi' ? 'कृपया तारीख चुनें' : 'Please select a date');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await onSave({
        type,
        amount: numAmount,
        category: category.trim(),
        date,
        note: note.trim() || undefined,
        order_id: initialData?.order_id || null,
        is_demo: initialData?.is_demo || false,
      });
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Save failed';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const getCatLabel = (cat: string) => {
    switch (cat) {
      case 'Bridal Makeup': return t.catBridalMakeup;
      case 'Party Makeup': return t.catPartyMakeup;
      case 'Hairstyling': return t.catHairstyling;
      case 'Facial & Cleanup': return t.catFacial;
      case 'Saree Draping': return t.catSareeDraping;
      case 'Other Service': return t.catOtherIncome;
      case 'Cosmetics & Products': return t.catProducts;
      case 'Travel & Transport': return t.catTravel;
      case 'Equipment & Tools': return t.catEquipment;
      case 'Shop / Parlor Rent': return t.catRent;
      case 'Other Expense': return t.catOtherExpense;
      default: return cat;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-header">
          <h3 className="modal-title">
            {initialData
              ? lang === 'hi' ? 'एंट्री बदलें' : 'Edit Entry'
              : type === 'income' ? t.addIncome : t.addExpense}
          </h3>
          <button type="button" onClick={onClose} className="icon-btn-ghost" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Type selector toggle */}
            {!initialData && (
              <div className="form-group">
                <label className="form-label">{t.type}</label>
                <div className="type-toggle-bar">
                  <button
                    type="button"
                    onClick={() => handleTypeChange('income')}
                    className={`type-toggle-btn ${type === 'income' ? 'income-active' : 'inactive'}`}
                  >
                    <ArrowDownRight size={18} />
                    <span>{t.income}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange('expense')}
                    className={`type-toggle-btn ${type === 'expense' ? 'expense-active' : 'inactive'}`}
                  >
                    <ArrowUpRight size={18} />
                    <span>{t.expense}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Amount with iOS decimal keypad */}
            <div className="form-group">
              <label className="form-label">{t.amount}</label>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                min="1"
                required
                placeholder="₹ 0"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="form-input"
                style={{ fontSize: '1.25rem', fontWeight: 800 }}
                autoFocus
              />

              {/* Quick amount chips with 44px min-height */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                {[500, 1000, 2000, 5000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(String(val))}
                    style={{
                      padding: '8px 14px',
                      minHeight: '44px',
                      borderRadius: '8px',
                      background: 'var(--bg-card-subtle)',
                      border: '1px solid var(--rose-border)',
                      fontSize: '0.88rem',
                      fontWeight: 700,
                      color: 'var(--text-main)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    + ₹{val.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div className="form-group">
              <label className="form-label">{t.category}</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="form-select"
                required
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {getCatLabel(cat)}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div className="form-group">
              <label className="form-label">{t.date}</label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="form-input"
              />
            </div>

            {/* Optional Note */}
            <div className="form-group">
              <label className="form-label">{t.optionalNote}</label>
              <input
                type="text"
                placeholder={lang === 'hi' ? 'उदा. फाउंडेशन, लिपस्टिक, यात्रा...' : 'e.g. Foundation kit, travel fare...'}
                value={note}
                onChange={e => setNote(e.target.value)}
                className="form-input"
              />
            </div>

            {errorMsg && (
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: '#FEE2E2',
                  border: '1px solid #FCA5A5',
                  color: '#DC2626',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                }}
              >
                {errorMsg}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary-modal">
              {t.cancel}
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary-modal">
              {isSubmitting ? t.saving : t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
