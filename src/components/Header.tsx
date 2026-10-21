'use client';

import React from 'react';
import { Globe, LayoutDashboard, CalendarCheck, Receipt } from 'lucide-react';
import { Language, translations } from '@/lib/translations';

interface HeaderProps {
  lang: Language;
  onToggleLang: () => void;
  activeTab?: 'dashboard' | 'transactions' | 'orders';
  onSelectTab?: (tab: 'dashboard' | 'transactions' | 'orders') => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onToggleLang,
  activeTab = 'dashboard',
  onSelectTab,
}) => {
  const t = translations[lang];

  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="brand-wrapper">
          <div className="brand-icon" aria-hidden="true">
            G
          </div>
          <div className="brand-text">
            <h1 className="brand-title">{t.appName}</h1>
            <p className="brand-tagline">{t.appTagline}</p>
          </div>
        </div>

        {onSelectTab && (
          <nav className="desktop-nav" aria-label="Desktop Navigation">
            <button
              type="button"
              onClick={() => onSelectTab('dashboard')}
              className={`desktop-nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            >
              <LayoutDashboard size={16} />
              <span>{t.dashboard}</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('orders')}
              className={`desktop-nav-link ${activeTab === 'orders' ? 'active' : ''}`}
            >
              <CalendarCheck size={16} />
              <span>{lang === 'hi' ? 'ऑर्डर्स' : 'Orders'}</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('transactions')}
              className={`desktop-nav-link ${activeTab === 'transactions' ? 'active' : ''}`}
            >
              <Receipt size={16} />
              <span>{lang === 'hi' ? 'खाता' : 'Cashbook'}</span>
            </button>
          </nav>
        )}

        <div className="header-actions">
          <button
            type="button"
            onClick={onToggleLang}
            className="lang-btn"
            title="Toggle Language / भाषा बदलें"
            aria-label={`Switch to ${lang === 'en' ? 'Hindi' : 'English'}`}
          >
            <Globe size={15} />
            <span>{lang === 'en' ? 'हिन्दी' : 'EN'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
