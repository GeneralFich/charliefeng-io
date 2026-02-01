import React from 'react';
import { View } from '../types';
import { Logo } from './Logo';
import { NavItem } from './NavItem';
import { MessageSquare, FileText, Menu, X, BookOpen } from 'lucide-react';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';

interface NavbarProps {
  currentView: View;
  onNavigate: (view: View, slug?: string, hash?: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, mobileMenuOpen, setMobileMenuOpen }) => {
  const { t } = useLanguage();

  return (
    <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo Area */}
            <button
              onClick={() => onNavigate(View.HOME)}
              className="group flex-shrink-0 flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none text-left"
              aria-label={t.nav.home}
            >
              <Logo className="w-8 h-8" />
              <div>
                <h1 className="text-white font-bold tracking-tight text-lg">Charlie Feng</h1>
                <div className="relative cursor-help w-max">
                  <p className="text-[10px] text-blue-400 uppercase tracking-widest font-semibold border-b border-dashed border-blue-400/50">{t.nav.digitalTwin}</p>
                  <div className="absolute top-full left-0 mt-2 hidden group-hover:block group-focus-visible:block w-max bg-slate-900/90 backdrop-blur-md text-xs text-slate-300 px-3 py-1.5 rounded border border-slate-700 shadow-xl z-50">
                    {t.nav.digitalTwinDesc}
                  </div>
                </div>
              </div>
            </button>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-2">
              <NavItem view={View.HOME} label={t.nav.chat} icon={MessageSquare} currentView={currentView} onNavigate={onNavigate} />
              <NavItem view={View.ABOUT} label={t.nav.about} icon={FileText} currentView={currentView} onNavigate={onNavigate} />
              <NavItem view={View.ESSAYS} label={t.nav.essays} icon={BookOpen} currentView={currentView} onNavigate={onNavigate} />
              <div className="ml-2 border-l border-slate-700 pl-2">
                <LanguageSwitcher />
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
               <LanguageSwitcher />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-slate-400 hover:text-white p-2"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                title={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileMenuOpen && (
          <div id="mobile-menu" className="md:hidden bg-slate-950 border-b border-slate-800 px-4 pt-2 pb-6 space-y-2">
            <NavItem view={View.HOME} label={t.nav.chat} icon={MessageSquare} currentView={currentView} onNavigate={onNavigate} />
            <NavItem view={View.ABOUT} label={t.nav.about} icon={FileText} currentView={currentView} onNavigate={onNavigate} />
            <NavItem view={View.ESSAYS} label={t.nav.essays} icon={BookOpen} currentView={currentView} onNavigate={onNavigate} />
          </div>
        )}
      </nav>
  );
};
