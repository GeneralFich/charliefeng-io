'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { cn } from '@/lib/cn';

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className="flex items-center gap-1 text-xs font-mono">
      <button
        onClick={() => switchLocale('en')}
        className={cn(
          'px-1.5 py-0.5 rounded transition-colors',
          locale === 'en'
            ? 'text-ghost bg-charcoal'
            : 'text-steel hover:text-ghost'
        )}
      >
        EN
      </button>
      <span className="text-silver/30">/</span>
      <button
        onClick={() => switchLocale('zh')}
        className={cn(
          'px-1.5 py-0.5 rounded transition-colors',
          locale === 'zh'
            ? 'text-ghost bg-charcoal'
            : 'text-steel hover:text-ghost'
        )}
      >
        中
      </button>
    </div>
  );
}
