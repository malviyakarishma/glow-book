'use client';

import React, { useState } from 'react';
import { Sparkles, Globe, Database, HardDrive, MoreVertical, Trash2, FolderDown } from 'lucide-react';
import { Language, translations } from '@/lib/translations';

interface HeaderProps {
  lang: Language;
  onToggleLang: () => void;
  isNeonConnected: boolean;
  onLoadDemo: () => void;
  onClearDemo: () => void;
  hasDemoData: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onToggleLang,
  isNeonConnected,
  onLoadDemo,
  onClearDemo,
  hasDemoData,
}) => {
  const t = translations[lang];
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="app-header">
      <div className="brand-wrapper">
        <div className="brand-icon">
          <Sparkles size={22} strokeWidth={2.4} />
        </div>
        <div>
          <div className="brand-title">
            <span>{t.appName}</span>
          </div>
          <div className="brand-tagline">{t.appTagline}</div>
        </div>
      </div>

      <div className="header-actions">
        {/* Language Switcher */}
        <button
          onClick={onToggleLang}
          className="lang-btn"
          title="Toggle Language / भाषा बदलें"
          aria-label="Toggle Language"
        >
          <Globe size={16} />
          <span>{lang === 'en' ? 'हिन्दी' : 'English'}</span>
        </button>

        {/* Database Status Indicator */}
        <div
          className={`db-pill ${isNeonConnected ? 'neon' : 'local'}`}
          title={isNeonConnected ? t.connectedNeon : t.localMode}
        >
          {isNeonConnected ? (
            <>
              <Database size={13} />
              <span>Neon</span>
            </>
          ) : (
            <>
              <HardDrive size={13} />
              <span>Offline/Local</span>
            </>
          )}
        </div>

        {/* Demo Data Menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="icon-btn-ghost"
            title="Options & Demo Data"
            aria-label="More options"
          >
            <MoreVertical size={18} />
          </button>

          {showMenu && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '46px',
                background: 'white',
                borderRadius: '14px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                border: '1.5px solid var(--rose-border)',
                minWidth: '200px',
                zIndex: 50,
                overflow: 'hidden',
                padding: '6px',
              }}
            >
              <button
                onClick={() => {
                  onLoadDemo();
                  setShowMenu(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: 'var(--text-main)',
                  textAlign: 'left',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-rose-tint)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <FolderDown size={16} color="var(--rose-primary)" />
                {t.loadDemo}
              </button>

              {hasDemoData && (
                <button
                  onClick={() => {
                    onClearDemo();
                    setShowMenu(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: '#DC2626',
                    textAlign: 'left',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#FEE2E2')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <Trash2 size={16} />
                  {t.clearDemo}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
