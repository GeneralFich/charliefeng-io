import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import type { ArtifactMeta } from '@/lib/mdx';
import { cn } from '@/lib/cn';

const typeColors: Record<string, string> = {
  Framework: 'badge-sapphire',
  'Decision Doc': 'badge-emerald',
  PRD: 'badge-ruby',
  Strategy: 'badge-steel',
};

export function ArtifactCard({ artifact }: { artifact: ArtifactMeta }) {
  const t = useTranslations('artifacts');

  return (
    <Link href={`/artifacts/${artifact.slug}`} className="group block">
      <div className="card-hover p-6 h-full flex flex-col">
        <span className={cn(typeColors[artifact.type] || 'badge-steel', 'self-start mb-3')}>
          {artifact.type}
        </span>
        <h3 className="font-heading text-lg font-semibold text-ghost group-hover:text-sapphire transition-colors">
          {artifact.title}
        </h3>
        <p className="mt-2 text-sm text-steel flex-1">
          {artifact.description}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-mono text-xs text-steel">
            {artifact.readTime} {t('readTime')}
          </span>
          <span className="text-sm text-sapphire flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}
