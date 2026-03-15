import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, FileText, BookOpen } from 'lucide-react';
import { View } from '../types';
import { useLanguage } from '../lib/i18n/LanguageContext';

interface MobileBottomNavProps {
  currentView: View;
  onNavigate: (view: View) => void;
}

interface NavTab {
  view: View;
  icon: React.FC<{ size?: number; className?: string }>;
  labelKey: 'chat' | 'about' | 'essays';
}

const TABS: NavTab[] = [
  { view: View.HOME,   icon: MessageSquare, labelKey: 'chat'   },
  { view: View.ABOUT,  icon: FileText,      labelKey: 'about'  },
  { view: View.ESSAYS, icon: BookOpen,      labelKey: 'essays' },
];

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentView, onNavigate }) => {
  const { t } = useLanguage();

  const labels: Record<NavTab['labelKey'], string> = {
    chat:   t.nav.chat,
    about:  t.nav.about,
    essays: t.nav.essays,
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 print:hidden"
      aria-label="Mobile navigation"
    >
      {/* Frosted-glass bar */}
      <div className="bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 flex items-stretch h-14 safe-pb">
        {TABS.map(({ view, icon: Icon, labelKey }) => {
          const isActive = currentView === view;
          return (
            <button
              key={view}
              onClick={() => onNavigate(view)}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset relative"
              aria-label={labels[labelKey]}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Active indicator pill */}
              {isActive && (
                <motion.span
                  layoutId="bottom-nav-pill"
                  className="absolute top-0 inset-x-4 h-0.5 rounded-full bg-blue-500"
                  transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                />
              )}

              <motion.div
                animate={{ scale: isActive ? 1.15 : 1, y: isActive ? -1 : 0 }}
                transition={{ type: 'spring', stiffness: 480, damping: 26 }}
              >
                <Icon
                  size={20}
                  className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}
                />
              </motion.div>

              <span
                className={`text-[10px] font-medium tracking-wide transition-colors ${
                  isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {labels[labelKey]}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
