'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, CheckCircle2 } from 'lucide-react';
import { Order, OrderStatus } from '@/lib/types';
import { Language, translations, INCOME_CATEGORIES } from '@/lib/translations';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (order: Omit<Order, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  initialData?: Order | null;
  lang: Language;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  lang,
}) => {
  const t = translations[lang];

  const [customerName, setCustomerName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [serviceType, setServiceType] = useState<string>(INCOME_CATEGORIES[0]);
  const [customService, setCustomService] = useState<string>('');
  const [appointmentDate, setAppointmentDate] = useState<string>('');
  const [appointmentTime, setAppointmentTime] = useState<string>('11:00 AM');
  const [totalPrice, setTotalPrice] = useState<string>('');
  const [advanceAmount, setAdvanceAmount] = useState<string>('0');
  const [notes, setNotes] = useState<string>('');
  const [status, setStatus] = useState<OrderStatus>('Upcoming');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setCustomerName(initialData.customer_name);
      setPhoneNumber(initialData.phone_number || '');
      if (INCOME_CATEGORIES.includes(initialData.service_type as (typeof INCOME_CATEGORIES)[number])) {
        setServiceType(initialData.service_type);
        setCustomService('');
      } else {
        setServiceType('Other Service');
        setCustomService(initialData.service_type);
      }
      setAppointmentDate(initialData.appointment_date);
      setAppointmentTime(initialData.appointment_time || '11:00 AM');
      setTotalPrice(String(initialData.total_price));
      setAdvanceAmount(String(initialData.advance_amount));
      setNotes(initialData.notes || '');
      setStatus(initialData.status);
    } else {
      setCustomerName('');
      setPhoneNumber('');
      setServiceType(INCOME_CATEGORIES[0]);
      setCustomService('');
      setAppointmentDate(new Date().toISOString().split('T')[0]);
      setAppointmentTime('11:00 AM');
      setTotalPrice('');
      setAdvanceAmount('0');
      setNotes('');
      setStatus('Upcoming');
    }
    setErrorMsg('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Real-time automatic balance calculation
  const priceNum = Number(totalPrice) || 0;
  const advanceNum = Number(advanceAmount) || 0;
  const remainingBalance = Math.max(0, priceNum - advanceNum);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setErrorMsg(lang === 'hi' ? 'कृपया ग्राहक का नाम दर्ज करें' : 'Please enter customer name');
      return;
    }
    if (!appointmentDate) {
      setErrorMsg(lang === 'hi' ? 'कृपया बुकिंग की तारीख चुनें' : 'Please select appointment date');
      return;
    }
    if (priceNum < 0 || advanceNum < 0) {
      setErrorMsg(lang === 'hi' ? 'रकम 0 या उससे अधिक होनी चाहिए' : 'Amounts cannot be negative');
      return;
    }

    const finalService =
      serviceType === 'Other Service' && customService.trim()
        ? customService.trim()
        : serviceType;

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await onSave({
        customer_name: customerName.trim(),
        phone_number: phoneNumber.trim() || undefined,
        service_type: finalService,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime.trim() || undefined,
        total_price: priceNum,
        advance_amount: advanceNum,
        remaining_balance: remainingBalance,
        notes: notes.trim() || undefined,
        status,
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

  const getServiceLabel = (cat: string) => {
    switch (cat) {
      case 'Bridal Makeup': return t.catBridalMakeup;
      case 'Party Makeup': return t.catPartyMakeup;
      case 'Hairstyling': return t.catHairstyling;
      case 'Facial & Cleanup': return t.catFacial;
      case 'Saree Draping': return t.catSareeDraping;
      case 'Other Service': return t.catOtherIncome;
      default: return cat;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {initialData
              ? lang === 'hi' ? 'बुकिंग बदलें' : 'Edit Booking'
              : t.addOrder}
          </h3>
          <button onClick={onClose} className="icon-btn-ghost" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Customer Name */}
            <div className="form-group">
              <label className="form-label">{t.customerName} *</label>
              <input
                type="text"
                required
                placeholder={lang === 'hi' ? 'उदा. पूजा शर्मा' : 'e.g. Pooja Sharma'}
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="form-input"
                autoFocus
              />
            </div>

            {/* Phone Number */}
            <div className="form-group">
              <label className="form-label">{t.phoneNumber}</label>
              <input
                type="tel"
                inputMode="tel"
                placeholder="9876543210"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                className="form-input"
              />
            </div>

            {/* Service Type */}
            <div className="form-group">
              <label className="form-label">{t.serviceType} *</label>
              <select
                value={serviceType}
                onChange={e => setServiceType(e.target.value)}
                className="form-select"
              >
                {INCOME_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>
                    {getServiceLabel(cat)}
                  </option>
                ))}
              </select>

              {serviceType === 'Other Service' && (
                <input
                  type="text"
                  placeholder={lang === 'hi' ? 'सर्विस का नाम लिखें' : 'Specify service name'}
                  value={customService}
                  onChange={e => setCustomService(e.target.value)}
                  className="form-input"
                  style={{ marginTop: '8px' }}
                />
              )}
            </div>

            {/* Date & Time Row */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t.appointmentDate} *</label>
                <input
                  type="date"
                  required
                  value={appointmentDate}
                  onChange={e => setAppointmentDate(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t.appointmentTime}</label>
                <input
                  type="text"
                  placeholder="11:00 AM"
                  value={appointmentTime}
                  onChange={e => setAppointmentTime(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>

            {/* Money Row: Total Price & Advance Paid */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">{t.totalPrice} *</label>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  required
                  placeholder="₹ 0"
                  value={totalPrice}
                  onChange={e => setTotalPrice(e.target.value)}
                  className="form-input"
                  style={{ fontWeight: 700 }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t.advanceAmount}</label>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  placeholder="₹ 0"
                  value={advanceAmount}
                  onChange={e => setAdvanceAmount(e.target.value)}
                  className="form-input"
                  style={{ fontWeight: 700 }}
                />
              </div>
            </div>

            {/* Real-time Calculated Balance Card */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: '12px',
                background: remainingBalance > 0 ? '#FFF7ED' : '#ECFDF5',
                border: `1.5px solid ${remainingBalance > 0 ? '#FDBA74' : '#A7F3D0'}`,
              }}
            >
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  {remainingBalance > 0 ? t.balanceDue : t.fullyPaid}
                </div>
                <div
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: remainingBalance > 0 ? '#C2410C' : '#047857',
                  }}
                >
                  ₹ {remainingBalance.toLocaleString('en-IN')}
                </div>
              </div>
              {advanceNum > 0 && (
                <div
                  style={{
                    fontSize: '0.82rem',
                    color: '#065F46',
                    background: '#D1FAE5',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <CheckCircle2 size={14} />
                  <span>
                    ₹{advanceNum.toLocaleString('en-IN')} {lang === 'hi' ? 'एडवांस जमा' : 'Advance Paid'}
                  </span>
                </div>
              )}
            </div>

            {/* Status (if editing) */}
            {initialData && (
              <div className="form-group">
                <label className="form-label">{t.status}</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as OrderStatus)}
                  className="form-select"
                >
                  <option value="Upcoming">{t.statusUpcoming}</option>
                  <option value="Completed">{t.statusCompleted}</option>
                  <option value="Cancelled">{t.statusCancelled}</option>
                </select>
              </div>
            )}

            {/* Optional Notes */}
            <div className="form-group">
              <label className="form-label">{t.notes}</label>
              <textarea
                rows={2}
                placeholder={lang === 'hi' ? 'उदा. ब्राइडल लहंगा लाल रंग का है, घर पर जाना है...' : 'e.g. Venue address, jewelry setting details...'}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="form-textarea"
              />
            </div>

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

            {/* Calm guidance notice */}
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', gap: '6px' }}>
              <Sparkles size={16} color="var(--rose-primary)" style={{ flexShrink: 0 }} />
              <span>{t.incomeRuleNote}</span>
            </div>
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
