'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { Menu, X } from 'lucide-react';
import { LocaleSwitcher } from './LocaleSwitcher';
import { cn } from '@/lib/cn';

const navItems = [
  { href: '/work', labelKey: 'work' },
  { href: '/artifacts', labelKey: 'artifacts' },
  { href: '/writing', labelKey: 'writing' },
  { href: '/about', labelKey: 'about' },
  { href: '/resume', labelKey: 'resume' },
] as const;

export function Header() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-silver/10 bg-obsidian/80 backdrop-blur-md">
      <div className="container-grid flex h-14 items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="font-heading text-lg font-semibold tracking-tight text-ghost hover:text-silver transition-colors"
        >
          Charlie Feng
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'text-sm transition-colors',
                pathname === item.href || pathname.startsWith(item.href + '/')
                  ? 'text-ghost'
                  : 'text-steel hover:text-ghost'
              )}
            >
              {t(item.labelKey)}
            </Link>
          ))}
          <LocaleSwitcher />
        </nav>

        {/* Mobile hamburger */}
        <div className="flex items-center gap-4 md:hidden">
          <LocaleSwitcher />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-steel hover:text-ghost transition-colors"
            aria-label={mobileOpen ? t('close') : t('menu')}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-silver/10 bg-obsidian/95 backdrop-blur-md">
          <div className="container-grid py-4 flex flex-col gap-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'text-sm py-1 transition-colors',
                  pathname === item.href || pathname.startsWith(item.href + '/')
                    ? 'text-ghost'
                    : 'text-steel hover:text-ghost'
                )}
              >
                {t(item.labelKey)}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
