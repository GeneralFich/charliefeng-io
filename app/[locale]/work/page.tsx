import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getAllCaseStudies } from '@/lib/mdx';
import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Work',
  description: 'Case studies in product leadership at Google, Amazon, and beyond.',
};

export default async function WorkPage() {
  const locale = await getLocale();
  const t = await getTranslations('featured');
  const studies = getAllCaseStudies(locale);

  return (
    <div className="container-grid py-20 md:py-28">
      <h1 className="font-heading text-3xl md:text-4xl font-bold tracking-tight text-ghost mb-4">
        {t('heading')}
      </h1>
      <p className="text-steel max-w-2xl mb-12">
        Product case studies from building infrastructure systems at scale.
      </p>

      <div className="grid gap-6">
        {studies.map((study) => (
          <Link
            key={study.slug}
            href={`/work/${study.slug}`}
            className="group block"
          >
            <div className="card-hover p-8">
              <div className="flex flex-wrap gap-2 mb-3">
                {study.tags.map((tag) => (
                  <span key={tag} className="badge-sapphire">{tag}</span>
                ))}
              </div>
              <h2 className="font-heading text-2xl font-semibold text-ghost group-hover:text-sapphire transition-colors">
                {study.title}
              </h2>
              <div className="mt-2 font-mono text-sm text-steel">
                {study.company} · {study.role} · {study.dates}
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-sapphire opacity-0 group-hover:opacity-100 transition-opacity">
                {t('cta')} <ArrowRight size={14} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
