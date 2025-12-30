import React from 'react';
import { View } from '../types';

interface NavItemProps {
  view: View;
  label: string;
  icon: any;
  currentView: View;
  onNavigate: (view: View) => void;
}

export const NavItem: React.FC<NavItemProps> = ({ view, label, icon: Icon, currentView, onNavigate }) => {
  const isActive = currentView === view;
  return (
    <button
      onClick={() => onNavigate(view)}
      aria-current={isActive ? 'page' : undefined}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
        isActive
          ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
      }`}
    >
      <Icon size={18} />
      <span className="font-medium tracking-wide text-sm">{label}</span>
    </button>
  );
};
