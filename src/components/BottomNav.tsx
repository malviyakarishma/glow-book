'use client';

import React from 'react';
import { LayoutDashboard, CalendarCheck, Receipt } from 'lucide-react';
import { Language, translations } from '@/lib/translations';

interface BottomNavProps {
  activeTab: 'dashboard' | 'transactions' | 'orders';
  onSelectTab: (tab: 'dashboard' | 'transactions' | 'orders') => void;
  lang: Language;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  lang,
}) => {
  const t = translations[lang];

  const items = [
    {
      id: 'dashboard' as const,
      label: t.dashboard,
      icon: LayoutDashboard,
    },
    {
      id: 'orders' as const,
      label: lang === 'hi' ? 'ऑर्डर्स' : 'Orders',
      icon: CalendarCheck,
    },
    {
      id: 'transactions' as const,
      label: lang === 'hi' ? 'खाता' : 'Cashbook',
      icon: Receipt,
    },
  ];

  return (
    <nav className="bottom-nav-bar" aria-label="Mobile Navigation">
      {items.map(item => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelectTab(item.id)}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
          >
            <div className="bottom-nav-icon-wrap">
              <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
            </div>
            <span className="bottom-nav-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
