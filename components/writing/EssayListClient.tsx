'use client';

import { useState } from 'react';
import { TagFilter } from './TagFilter';
import { EssayCard } from './EssayCard';
import { useTranslations } from 'next-intl';
import type { EssayMeta } from '@/lib/mdx';

export function EssayListClient({
  essays,
  allTags,
}: {
  essays: EssayMeta[];
  allTags: string[];
}) {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const t = useTranslations('writing');

  const filtered = activeTag
    ? essays.filter((e) => e.tags.includes(activeTag))
    : essays;

  return (
    <>
      <div className="mb-10">
        <TagFilter tags={allTags} activeTag={activeTag} onTagChange={setActiveTag} />
      </div>

      {filtered.length === 0 ? (
        <p className="text-steel text-center py-12">{t('noResults')}</p>
      ) : (
        <div className="grid gap-6">
          {filtered.map((essay) => (
            <EssayCard key={essay.slug} essay={essay} />
          ))}
        </div>
      )}
    </>
  );
}
