'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, IndianRupee } from 'lucide-react';
import { Order } from '@/lib/types';
import { Language, translations } from '@/lib/translations';

interface CollectPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onConfirm: (
    orderId: string,
    amount: number,
    paymentDate: string,
    note?: string,
    markCompleted?: boolean
  ) => Promise<void>;
  lang: Language;
}

export const CollectPaymentModal: React.FC<CollectPaymentModalProps> = ({
  isOpen,
  onClose,
  order,
  onConfirm,
  lang,
}) => {
  const t = translations[lang];

  const [amount, setAmount] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>('');
  const [paymentNote, setPaymentNote] = useState<string>('');
  const [markCompleted, setMarkCompleted] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (order) {
      setAmount(String(order.remaining_balance));
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setPaymentNote(
        lang === 'hi'
          ? `${order.customer_name} से बाकी भुगतान मिला`
          : `Balance payment from ${order.customer_name}`
      );
      setMarkCompleted(true);
      setErrorMsg('');
    }
  }, [order, isOpen, lang]);

  if (!isOpen || !order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(amount);
    if (isNaN(num) || num <= 0) {
      setErrorMsg(lang === 'hi' ? 'रकम 0 से अधिक होनी चाहिए' : 'Payment amount must be greater than 0');
      return;
    }
    if (num > order.remaining_balance) {
      // allow, but confirm or cap
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await onConfirm(
        order.id,
        num,
        paymentDate,
        paymentNote.trim() || undefined,
        markCompleted
      );
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Payment recording failed';
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{t.recordRemainingTitle}</h3>
          <button onClick={onClose} className="icon-btn-ghost" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Customer Summary Card */}
            <div
              style={{
                background: 'var(--bg-card-subtle)',
                borderRadius: '14px',
                padding: '14px 16px',
                border: '1.5px solid var(--rose-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>{order.customer_name}</span>
                <span
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: 'var(--rose-primary)',
                    background: 'var(--bg-rose-tint)',
                    padding: '3px 8px',
                    borderRadius: '8px',
                  }}
                >
                  {order.service_type}
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px',
                  paddingTop: '8px',
                  borderTop: '1px dashed var(--rose-border-subtle)',
                  fontSize: '0.82rem',
                }}
              >
                <div>
                  <div style={{ color: 'var(--text-muted)' }}>{t.totalPrice}</div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>₹{order.total_price.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)' }}>{t.advanceAmount}</div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--income-text)' }}>
                    ₹{order.advance_amount.toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)' }}>{t.balanceDue}</div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: '#C2410C' }}>
                    ₹{order.remaining_balance.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>

            {/* Amount paying now */}
            <div className="form-group">
              <label className="form-label">{t.amountPayingNow}</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="1"
                  required
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="form-input"
                  style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--income-text)' }}
                  autoFocus
                />
              </div>
            </div>

            {/* Payment Date */}
            <div className="form-group">
              <label className="form-label">{t.paymentDate}</label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={e => setPaymentDate(e.target.value)}
                className="form-input"
              />
            </div>

            {/* Payment Note */}
            <div className="form-group">
              <label className="form-label">{t.paymentNote}</label>
              <input
                type="text"
                value={paymentNote}
                onChange={e => setPaymentNote(e.target.value)}
                className="form-input"
              />
            </div>

            {/* Mark Completed Checkbox */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px',
                borderRadius: '10px',
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                cursor: 'pointer',
              }}
            >
              <input
                type="checkbox"
                checked={markCompleted}
                onChange={e => setMarkCompleted(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#059669' }}
              />
              <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#065F46' }}>
                {t.markOrderCompleted}
              </span>
            </label>

            {errorMsg && (
              <div
                style={{
                  padding: '10px 14px',
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
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary-modal"
              style={{ background: 'linear-gradient(135deg, #257C58 0%, #175F42 100%)' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={18} />
                {isSubmitting ? t.saving : t.collectPayment}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
