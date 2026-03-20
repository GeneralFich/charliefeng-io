'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';

interface ViewToggleProps {
  view: 'narrative' | 'traditional';
  onViewChange: (view: 'narrative' | 'traditional') => void;
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  const t = useTranslations('resume');

  return (
    <div className="inline-flex rounded-lg border border-silver/20 p-0.5">
      <button
        onClick={() => onViewChange('narrative')}
        className={cn(
          'px-4 py-1.5 rounded-md text-sm font-mono transition-colors',
          view === 'narrative'
            ? 'bg-charcoal text-ghost'
            : 'text-steel hover:text-ghost'
        )}
      >
        {t('narrative')}
      </button>
      <button
        onClick={() => onViewChange('traditional')}
        className={cn(
          'px-4 py-1.5 rounded-md text-sm font-mono transition-colors',
          view === 'traditional'
            ? 'bg-charcoal text-ghost'
            : 'text-steel hover:text-ghost'
        )}
      >
        {t('traditional')}
      </button>
    </div>
  );
}
