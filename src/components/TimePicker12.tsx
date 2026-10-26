'use client';

import React from 'react';
import { AmPm, Time12, formatTime12, parseTime12, DEFAULT_TIME_12 } from '@/lib/dates';

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5); // 00, 05, … 55

interface TimePicker12Props {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  'aria-label'?: string;
}

function partsFromValue(value: string): Time12 {
  return parseTime12(value) ?? parseTime12(DEFAULT_TIME_12)!;
}

export const TimePicker12: React.FC<TimePicker12Props> = ({
  value,
  onChange,
  required,
  'aria-label': ariaLabel,
}) => {
  const parts = partsFromValue(value);
  const minuteOptions = MINUTES.includes(parts.minute)
    ? MINUTES
    : [...MINUTES, parts.minute].sort((a, b) => a - b);

  const update = (patch: Partial<Time12>) => {
    const next: Time12 = {
      hour: patch.hour ?? parts.hour,
      minute: patch.minute ?? parts.minute,
      period: patch.period ?? parts.period,
    };
    onChange(formatTime12(next));
  };

  return (
    <div className="time-picker-12" role="group" aria-label={ariaLabel}>
      <select
        className="form-select time-picker-hour"
        value={parts.hour}
        required={required}
        aria-label="Hour"
        onChange={e => update({ hour: Number(e.target.value) })}
      >
        {HOURS.map(h => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>

      <span className="time-picker-sep" aria-hidden="true">
        :
      </span>

      <select
        className="form-select time-picker-minute"
        value={parts.minute}
        required={required}
        aria-label="Minute"
        onChange={e => update({ minute: Number(e.target.value) })}
      >
        {minuteOptions.map(m => (
          <option key={m} value={m}>
            {String(m).padStart(2, '0')}
          </option>
        ))}
      </select>

      <select
        className="form-select time-picker-period"
        value={parts.period}
        required={required}
        aria-label="AM or PM"
        onChange={e => update({ period: e.target.value as AmPm })}
      >
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
};
