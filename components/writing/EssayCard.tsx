import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import type { EssayMeta } from '@/lib/mdx';

export function EssayCard({ essay }: { essay: EssayMeta }) {
  const t = useTranslations('writing');

  return (
    <Link href={`/writing/${essay.slug}`} className="group block">
      <article className="card-hover p-6">
        <div className="flex flex-wrap gap-2 mb-3">
          {essay.tags.map((tag) => (
            <span key={tag} className="badge-steel">{tag}</span>
          ))}
        </div>
        <h2 className="font-heading text-xl font-semibold text-ghost group-hover:text-sapphire transition-colors">
          {essay.title}
        </h2>
        <p className="mt-2 text-sm text-steel line-clamp-2">
          {essay.description}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-3 font-mono text-xs text-steel">
            <span>{essay.date}</span>
            <span className="text-silver/30">·</span>
            <span>{essay.readTime} {t('minRead')}</span>
          </div>
          <span className="text-sm text-sapphire flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {t('readMore')} <ArrowRight size={14} />
          </span>
        </div>
      </article>
    </Link>
  );
}
