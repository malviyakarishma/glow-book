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
      <div className="modal-sheet confirm-sheet" onClick={e => e.stopPropagation()}>
        <div className="confirm-body">
          <div className="confirm-icon">
            <AlertTriangle size={24} />
          </div>
          <h3 className="confirm-title">{title}</h3>
          <p className="confirm-desc">{description || t.confirmDeleteDesc}</p>
          <div className="confirm-actions">
            <button type="button" onClick={onClose} className="btn-secondary-modal">
              {t.cancel}
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="btn-primary-modal btn-danger"
            >
              {t.delete}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
