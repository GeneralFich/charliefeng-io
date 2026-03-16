import { getLocale, getTranslations } from 'next-intl/server';
import { getAllArtifacts } from '@/lib/mdx';
import { ArtifactListClient } from '@/components/artifacts/ArtifactListClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Product Artifacts',
  description: 'Frameworks, documents, and decision tools from real product work.',
};

export default async function ArtifactsPage() {
  const locale = await getLocale();
  const t = await getTranslations('artifacts');
  const artifacts = getAllArtifacts(locale);

  return (
    <div className="container-grid py-20 md:py-28">
      <h1 className="font-heading text-3xl md:text-4xl font-bold tracking-tight text-ghost mb-4">
        {t('heading')}
      </h1>
      <p className="text-steel max-w-2xl mb-12">
        {t('subline')}
      </p>

      <ArtifactListClient artifacts={artifacts} />
    </div>
  );
}
