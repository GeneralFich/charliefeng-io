'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArtifactCard } from './ArtifactCard';
import { cn } from '@/lib/cn';
import type { ArtifactMeta } from '@/lib/mdx';

const filterTabs = ['All', 'PRDs', 'Decision Docs', 'Frameworks', 'Strategy'] as const;
const tabToType: Record<string, string | null> = {
  All: null,
  PRDs: 'PRD',
  'Decision Docs': 'Decision Doc',
  Frameworks: 'Framework',
  Strategy: 'Strategy',
};

export function ArtifactListClient({ artifacts }: { artifacts: ArtifactMeta[] }) {
  const [activeTab, setActiveTab] = useState<string>('All');
  const t = useTranslations('artifacts');

  const typeFilter = tabToType[activeTab];
  const filtered = typeFilter
    ? artifacts.filter((a) => a.type === typeFilter)
    : artifacts;

  const tabKeys: Record<string, string> = {
    All: 'all',
    PRDs: 'prds',
    'Decision Docs': 'decisions',
    Frameworks: 'frameworks',
    Strategy: 'strategy',
  };

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-10">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-mono transition-colors border',
              activeTab === tab
                ? 'bg-ghost text-obsidian border-ghost'
                : 'text-steel border-silver/20 hover:text-ghost hover:border-silver/40'
            )}
          >
            {t(tabKeys[tab])}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((artifact) => (
          <ArtifactCard key={artifact.slug} artifact={artifact} />
        ))}
      </div>
    </>
  );
}
