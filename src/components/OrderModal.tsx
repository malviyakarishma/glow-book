'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { X, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { Order, OrderStatus } from '@/lib/types';
import { Language, translations, INCOME_CATEGORIES } from '@/lib/translations';
import { eachDateInRange, formatReadableDate, localToday } from '@/lib/dates';

interface DaySchedule {
  date: string;
  times: string[];
}

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (order: Omit<Order, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onSaveMany?: (orders: Omit<Order, 'id' | 'created_at' | 'updated_at'>[]) => Promise<void>;
  initialData?: Order | null;
  lang: Language;
}

function syncSchedules(prev: DaySchedule[], dates: string[], defaultTime = '11:00 AM'): DaySchedule[] {
  const map = new Map(prev.map(d => [d.date, d.times]));
  return dates.map(date => ({
    date,
    times: map.get(date) ?? [defaultTime],
  }));
}

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onSaveMany,
  initialData,
  lang,
}) => {
  const t = translations[lang];
  const locale = lang === 'hi' ? 'hi-IN' : 'en-IN';
  const isEditing = Boolean(initialData);

  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [serviceType, setServiceType] = useState<string>(INCOME_CATEGORIES[0]);
  const [customService, setCustomService] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [daySchedules, setDaySchedules] = useState<DaySchedule[]>([]);
  const [totalPrice, setTotalPrice] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState('0');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<OrderStatus>('Upcoming');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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
      setDateFrom(initialData.appointment_date);
      setDateTo(initialData.appointment_date);
      setDaySchedules([
        {
          date: initialData.appointment_date,
          times: [initialData.appointment_time || '11:00 AM'],
        },
      ]);
      setTotalPrice(String(initialData.total_price));
      setAdvanceAmount(String(initialData.advance_amount));
      setNotes(initialData.notes || '');
      setStatus(initialData.status);
    } else {
      const today = localToday();
      setCustomerName('');
      setPhoneNumber('');
      setServiceType(INCOME_CATEGORIES[0]);
      setCustomService('');
      setDateFrom(today);
      setDateTo(today);
      setDaySchedules([{ date: today, times: ['11:00 AM'] }]);
      setTotalPrice('');
      setAdvanceAmount('0');
      setNotes('');
      setStatus('Upcoming');
    }
    setErrorMsg('');
  }, [initialData, isOpen]);

  // Keep per-date times in sync when From/To changes
  useEffect(() => {
    if (!isOpen || isEditing || !dateFrom) return;
    const dates = eachDateInRange(dateFrom, dateTo || dateFrom);
    setDaySchedules(prev => syncSchedules(prev, dates));
  }, [dateFrom, dateTo, isOpen, isEditing]);

  const slots = useMemo(() => {
    const list: { date: string; time: string }[] = [];
    for (const day of daySchedules) {
      const clean = day.times.map(tm => tm.trim()).filter(Boolean);
      if (clean.length === 0) {
        list.push({ date: day.date, time: '' });
      } else {
        for (const time of clean) {
          list.push({ date: day.date, time });
        }
      }
    }
    return list;
  }, [daySchedules]);

  if (!isOpen) return null;

  const priceNum = Number(totalPrice) || 0;
  const advanceNum = Number(advanceAmount) || 0;
  const remainingBalance = Math.max(0, priceNum - advanceNum);

  const updateDayTime = (date: string, timeIndex: number, value: string) => {
    setDaySchedules(prev =>
      prev.map(day =>
        day.date === date
          ? { ...day, times: day.times.map((tm, i) => (i === timeIndex ? value : tm)) }
          : day
      )
    );
  };

  const addDayTime = (date: string) => {
    setDaySchedules(prev =>
      prev.map(day => (day.date === date ? { ...day, times: [...day.times, ''] } : day))
    );
  };

  const removeDayTime = (date: string, timeIndex: number) => {
    setDaySchedules(prev =>
      prev.map(day => {
        if (day.date !== date) return day;
        if (day.times.length <= 1) return day;
        return { ...day, times: day.times.filter((_, i) => i !== timeIndex) };
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setErrorMsg(lang === 'hi' ? 'कृपया ग्राहक का नाम दर्ज करें' : 'Please enter customer name');
      return;
    }
    if (!dateFrom) {
      setErrorMsg(lang === 'hi' ? 'कृपया बुकिंग की तारीख चुनें' : 'Please select appointment date');
      return;
    }
    if (dateTo && dateTo < dateFrom) {
      setErrorMsg(lang === 'hi' ? 'अंतिम तारीख शुरू तारीख से पहले नहीं हो सकती' : 'End date cannot be before start date');
      return;
    }
    if (priceNum < 0 || advanceNum < 0) {
      setErrorMsg(lang === 'hi' ? 'रकम 0 या उससे अधिक होनी चाहिए' : 'Amounts cannot be negative');
      return;
    }
    if (slots.length === 0) {
      setErrorMsg(lang === 'hi' ? 'कम से कम एक तारीख चुनें' : 'Please select at least one date');
      return;
    }

    const missingTime = daySchedules.some(day => !day.times.some(tm => tm.trim()));
    if (missingTime) {
      setErrorMsg(
        lang === 'hi'
          ? 'कृपया हर तारीख के लिए कम से कम एक समय लिखें'
          : 'Please enter at least one time for each date'
      );
      return;
    }

    const finalService =
      serviceType === 'Other Service' && customService.trim()
        ? customService.trim()
        : serviceType;

    try {
      setIsSubmitting(true);
      setErrorMsg('');

      if (isEditing || slots.length === 1) {
        const slot = slots[0];
        await onSave({
          customer_name: customerName.trim(),
          phone_number: phoneNumber.trim() || undefined,
          service_type: finalService,
          appointment_date: slot.date,
          appointment_time: slot.time || undefined,
          total_price: priceNum,
          advance_amount: advanceNum,
          remaining_balance: remainingBalance,
          notes: notes.trim() || undefined,
          status,
          is_demo: initialData?.is_demo || false,
        });
      } else {
        const payload = slots.map((slot, index) => {
          const advance = index === 0 ? advanceNum : 0;
          return {
            customer_name: customerName.trim(),
            phone_number: phoneNumber.trim() || undefined,
            service_type: finalService,
            appointment_date: slot.date,
            appointment_time: slot.time || undefined,
            total_price: priceNum,
            advance_amount: advance,
            remaining_balance: Math.max(0, priceNum - advance),
            notes: notes.trim() || undefined,
            status: 'Upcoming' as OrderStatus,
            is_demo: false,
          };
        });

        if (onSaveMany) {
          await onSaveMany(payload);
        } else {
          for (const order of payload) {
            await onSave(order);
          }
        }
      }
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
            {isEditing
              ? lang === 'hi' ? 'बुकिंग बदलें' : 'Edit Booking'
              : t.addOrder}
          </h3>
          <button onClick={onClose} className="icon-btn-ghost" aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
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

            {/* Date range */}
            {isEditing ? (
              <div className="form-group">
                <label className="form-label">{t.appointmentDate} *</label>
                <input
                  type="date"
                  required
                  value={dateFrom}
                  onChange={e => {
                    const d = e.target.value;
                    setDateFrom(d);
                    setDateTo(d);
                    setDaySchedules(prev => [
                      {
                        date: d,
                        times: prev[0]?.times?.length ? prev[0].times : ['11:00 AM'],
                      },
                    ]);
                  }}
                  className="form-input"
                />
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label">{t.bookingDates} *</label>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label-sub">{t.dateFrom}</label>
                    <input
                      type="date"
                      required
                      value={dateFrom}
                      onChange={e => {
                        setDateFrom(e.target.value);
                        if (!dateTo || dateTo < e.target.value) setDateTo(e.target.value);
                      }}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label-sub">{t.dateTo}</label>
                    <input
                      type="date"
                      required
                      value={dateTo}
                      min={dateFrom}
                      onChange={e => setDateTo(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>
                <p className="form-hint">
                  {lang === 'hi'
                    ? 'तारीख चुनने के बाद हर दिन का अलग समय सेट करें।'
                    : 'After picking dates, set a different time for each day below.'}
                </p>
              </div>
            )}

            {/* Per-date times */}
            <div className="form-group">
              <label className="form-label">
                {isEditing ? t.appointmentTime : t.timePerDate} *
              </label>

              <div className="day-schedule-list">
                {daySchedules.map(day => (
                  <div key={day.date} className="day-schedule-card">
                    <div className="day-schedule-header">
                      <span className="day-schedule-date">
                        {formatReadableDate(day.date, locale)}
                      </span>
                      {!isEditing && (
                        <button
                          type="button"
                          onClick={() => addDayTime(day.date)}
                          className="btn-text-add"
                        >
                          <Plus size={15} />
                          <span>{t.addTimeSlot}</span>
                        </button>
                      )}
                    </div>

                    <div className="time-slots-list">
                      {day.times.map((tm, timeIndex) => (
                        <div key={`${day.date}-${timeIndex}`} className="time-slot-row">
                          <input
                            type="text"
                            required
                            placeholder={lang === 'hi' ? 'उदा. 11:00 AM' : 'e.g. 11:00 AM'}
                            value={tm}
                            onChange={e => updateDayTime(day.date, timeIndex, e.target.value)}
                            className="form-input"
                            aria-label={`Time for ${day.date}`}
                          />
                          {!isEditing && day.times.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeDayTime(day.date, timeIndex)}
                              className="icon-btn-ghost danger"
                              aria-label="Remove time"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {!isEditing && daySchedules.length > 1 && (
                <p className="form-hint">
                  {lang === 'hi'
                    ? 'एक दिन में 2–3 बार तैयार होना हो तो उस दिन पर “समय जोड़ें” दबाएँ।'
                    : 'Need 2–3 visits on one day? Use “Add time” on that day only.'}
                </p>
              )}
            </div>

            {!isEditing && slots.length > 1 && (
              <div className="slot-preview">
                <div className="slot-preview-title">
                  {t.willCreateBookings.replace('{count}', String(slots.length))}
                </div>
                <ul className="slot-preview-list">
                  {slots.slice(0, 10).map((slot, i) => (
                    <li key={`${slot.date}-${slot.time}-${i}`}>
                      {formatReadableDate(slot.date, locale)}
                      {slot.time ? ` · ${slot.time}` : ''}
                    </li>
                  ))}
                  {slots.length > 10 && (
                    <li className="slot-preview-more">
                      +{slots.length - 10} {lang === 'hi' ? 'और' : 'more'}
                    </li>
                  )}
                </ul>
                {advanceNum > 0 && (
                  <p className="form-hint" style={{ marginTop: 8 }}>
                    {t.advanceOnFirstOnly}
                  </p>
                )}
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  {!isEditing && slots.length > 1 ? t.pricePerVisit : t.totalPrice} *
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="any"
                  required
                  placeholder="₹ 0"
                  value={totalPrice}
                  onChange={e => setTotalPrice(e.target.value)}
                  className="form-input amount-input"
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
                  className="form-input amount-input"
                />
              </div>
            </div>

            <div className={`balance-summary ${remainingBalance > 0 ? 'due' : 'paid'}`}>
              <div>
                <div className="balance-summary-label">
                  {remainingBalance > 0 ? t.balanceDue : t.fullyPaid}
                  {!isEditing && slots.length > 1
                    ? ` (${lang === 'hi' ? 'प्रति विज़िट' : 'per visit'})`
                    : ''}
                </div>
                <div className="balance-summary-value">
                  ₹ {remainingBalance.toLocaleString('en-IN')}
                </div>
              </div>
              {advanceNum > 0 && (
                <div className="advance-chip">
                  <CheckCircle2 size={14} />
                  <span>
                    ₹{advanceNum.toLocaleString('en-IN')} {lang === 'hi' ? 'एडवांस' : 'Advance'}
                  </span>
                </div>
              )}
            </div>

            {isEditing && (
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

            <div className="form-group">
              <label className="form-label">{t.notes}</label>
              <textarea
                rows={2}
                placeholder={
                  lang === 'hi'
                    ? 'उदा. ब्राइडल लहंगा लाल रंग का है, घर पर जाना है...'
                    : 'e.g. Venue address, jewelry setting details...'
                }
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="form-textarea"
              />
            </div>

            {errorMsg && <div className="form-error">{errorMsg}</div>}

            <p className="form-hint">{t.incomeRuleNote}</p>
          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary-modal">
              {t.cancel}
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary-modal">
              {isSubmitting
                ? t.saving
                : !isEditing && slots.length > 1
                ? t.saveBookings.replace('{count}', String(slots.length))
                : t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
