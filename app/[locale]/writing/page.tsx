import { getLocale, getTranslations } from 'next-intl/server';
import { getAllEssays } from '@/lib/mdx';
import { EssayListClient } from '@/components/writing/EssayListClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Writing',
  description: 'Product thinking, technology trends, and lessons from building at scale.',
};

export default async function WritingPage() {
  const locale = await getLocale();
  const t = await getTranslations('writing');
  const essays = getAllEssays(locale);

  const allTags = Array.from(
    new Set(essays.flatMap((e) => e.tags))
  ).sort();

  return (
    <div className="container-grid py-20 md:py-28">
      <h1 className="font-heading text-3xl md:text-4xl font-bold tracking-tight text-ghost mb-4">
        {t('heading')}
      </h1>
      <p className="text-steel max-w-2xl mb-12">
        {t('subline')}
      </p>

      <EssayListClient essays={essays} allTags={allTags} />
    </div>
  );
}
