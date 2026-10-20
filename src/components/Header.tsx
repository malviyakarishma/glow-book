'use client';

import React, { useState } from 'react';
import { Sparkles, Globe, MoreVertical, Trash2, FolderDown, LayoutDashboard, CalendarCheck, Receipt } from 'lucide-react';
import { Language, translations } from '@/lib/translations';

interface HeaderProps {
  lang: Language;
  onToggleLang: () => void;
  isNeonConnected: boolean;
  onLoadDemo: () => void;
  onClearDemo: () => void;
  hasDemoData: boolean;
  activeTab?: 'dashboard' | 'transactions' | 'orders';
  onSelectTab?: (tab: 'dashboard' | 'transactions' | 'orders') => void;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onToggleLang,
  isNeonConnected,
  onLoadDemo,
  onClearDemo,
  hasDemoData,
  activeTab = 'dashboard',
  onSelectTab,
}) => {
  const t = translations[lang];
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="app-header">
      <div className="header-inner">
        {/* Brand */}
        <div className="brand-wrapper">
          <div className="brand-icon" aria-hidden="true">
            <Sparkles size={20} strokeWidth={2.4} />
          </div>
          <div className="brand-text">
            <h1 className="brand-title">{t.appName}</h1>
            <p className="brand-tagline">{t.appTagline}</p>
          </div>
        </div>

        {/* Desktop Navigation Links (Visible on >= 768px) */}
        {onSelectTab && (
          <nav className="desktop-nav" aria-label="Desktop Navigation">
            <button
              type="button"
              onClick={() => onSelectTab('dashboard')}
              className={`desktop-nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            >
              <LayoutDashboard size={17} />
              <span>{t.dashboard}</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('orders')}
              className={`desktop-nav-link ${activeTab === 'orders' ? 'active' : ''}`}
            >
              <CalendarCheck size={17} />
              <span>{t.orders}</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectTab('transactions')}
              className={`desktop-nav-link ${activeTab === 'transactions' ? 'active' : ''}`}
            >
              <Receipt size={17} />
              <span>{t.incomeExpense}</span>
            </button>
          </nav>
        )}

        {/* Header Actions */}
        <div className="header-actions">
          {/* Language Switcher */}
          <button
            type="button"
            onClick={onToggleLang}
            className="lang-btn"
            title="Toggle Language / भाषा बदलें"
            aria-label={`Switch to ${lang === 'en' ? 'Hindi' : 'English'}`}
          >
            <Globe size={15} />
            <span>{lang === 'en' ? 'हिन्दी' : 'English'}</span>
          </button>

          {/* Options / Demo Data Menu */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="icon-btn-ghost header-menu-btn"
              title="Options & Data"
              aria-label="More options"
              aria-expanded={showMenu}
            >
              <MoreVertical size={18} />
            </button>

            {showMenu && (
              <>
                <div
                  className="dropdown-backdrop"
                  onClick={() => setShowMenu(false)}
                />
                <div className="dropdown-menu">
                  {/* Subtle status indicator */}
                  <div
                    style={{
                      padding: '8px 12px',
                      fontSize: '0.78rem',
                      color: 'var(--text-muted)',
                      borderBottom: '1px solid var(--rose-border)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '7px',
                    }}
                  >
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: isNeonConnected ? '#10B981' : '#F59E0B',
                        display: 'inline-block',
                      }}
                    />
                    <span>{isNeonConnected ? t.connectedDb : t.localMode}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onLoadDemo();
                      setShowMenu(false);
                    }}
                    className="dropdown-item"
                  >
                    <FolderDown size={16} color="var(--rose-primary)" />
                    <span>{t.loadDemo}</span>
                  </button>

                  {hasDemoData && (
                    <button
                      type="button"
                      onClick={() => {
                        onClearDemo();
                        setShowMenu(false);
                      }}
                      className="dropdown-item danger"
                    >
                      <Trash2 size={16} />
                      <span>{t.clearDemo}</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
