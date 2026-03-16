'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/cn';

interface TagFilterProps {
  tags: string[];
  activeTag: string | null;
  onTagChange: (tag: string | null) => void;
}

export function TagFilter({ tags, activeTag, onTagChange }: TagFilterProps) {
  const t = useTranslations('writing');

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onTagChange(null)}
        className={cn(
          'px-3 py-1.5 rounded-full text-xs font-mono transition-colors border',
          activeTag === null
            ? 'bg-ghost text-obsidian border-ghost'
            : 'text-steel border-silver/20 hover:text-ghost hover:border-silver/40'
        )}
      >
        {t('all')}
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => onTagChange(tag === activeTag ? null : tag)}
          className={cn(
            'px-3 py-1.5 rounded-full text-xs font-mono transition-colors border',
            activeTag === tag
              ? 'bg-ghost text-obsidian border-ghost'
              : 'text-steel border-silver/20 hover:text-ghost hover:border-silver/40'
          )}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
