'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Language, translations } from '@/lib/translations';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  lang: Language;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  lang,
}) => {
  const t = translations[lang];
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-sheet"
        style={{ maxWidth: '440px', borderRadius: '24px' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: '#FEE2E2',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AlertTriangle size={30} />
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)' }}>
            {title}
          </h3>

          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            {description || t.confirmDeleteDesc}
          </p>

          <div style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '8px' }}>
            <button
              onClick={onClose}
              className="btn-secondary-modal"
              style={{ flex: 1, padding: '12px' }}
            >
              {t.cancel}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="btn-primary-modal"
              style={{
                flex: 1,
                padding: '12px',
                background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)',
              }}
            >
              {t.delete}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
