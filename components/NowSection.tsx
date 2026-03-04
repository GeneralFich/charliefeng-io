import React from 'react';
import { ExternalLink } from 'lucide-react';
import { useLanguage } from '../lib/i18n/LanguageContext';
import nowItems from '../content/now.json';

type Status = 'Active' | 'Shipped' | 'Exploring';

interface NowItem {
  title: string;
  status: Status;
  description: string;
  link?: string;
}

const statusStyles: Record<Status, string> = {
  Active:
    'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400',
  Shipped:
    'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400',
  Exploring:
    'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400',
};

export const NowSection: React.FC = () => {
  const { t } = useLanguage();
  const items = nowItems as NowItem[];

  const statusLabel = (status: Status) => {
    const map: Record<Status, string> = {
      Active: t.now.statusActive,
      Shipped: t.now.statusShipped,
      Exploring: t.now.statusExploring,
    };
    return map[status];
  };

  return (
    <section className="mb-8">
      {/* Section header */}
      <h3 className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-1.5 mb-3">
        <span
          className="w-1.5 h-1.5 rounded-full bg-emerald-500"
          style={{ animation: 'pulse-live 2s ease-in-out infinite' }}
        />
        {t.now.heading}
      </h3>

      {/* Cards */}
      <div className="space-y-2">
        {items.map((item) => {
          const inner = (
            <>
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${statusStyles[item.status]}`}
                >
                  {statusLabel(item.status)}
                </span>
                {item.link && (
                  <ExternalLink
                    size={10}
                    className="text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                  />
                )}
              </div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                {item.title}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                {item.description}
              </p>
            </>
          );

          const className =
            'w-full text-left group block px-3 py-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent hover:border-slate-200 dark:hover:border-slate-700/50 transition-all duration-200';

          return item.link ? (
            <a
              key={item.title}
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className={className}
            >
              {inner}
            </a>
          ) : (
            <div key={item.title} className={className}>
              {inner}
            </div>
          );
        })}
      </div>
    </section>
  );
};
