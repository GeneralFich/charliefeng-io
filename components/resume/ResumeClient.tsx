'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ViewToggle } from './ViewToggle';
import { NarrativeView } from './NarrativeView';
import { TraditionalView } from './TraditionalView';
import { Download } from 'lucide-react';
import type { ResumeData, NarrativeSection } from '@/lib/resume';

export function ResumeClient({
  data,
  narrativeSections,
}: {
  data: ResumeData;
  narrativeSections: NarrativeSection[];
}) {
  const [view, setView] = useState<'narrative' | 'traditional'>('narrative');
  const t = useTranslations('resume');

  const handleExportPdf = () => {
    window.print();
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12">
        <ViewToggle view={view} onViewChange={setView} />
        <button
          onClick={handleExportPdf}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-mono text-steel border border-silver/20 rounded-lg hover:text-ghost hover:border-silver/40 transition-colors"
        >
          <Download size={14} />
          {t('exportPdf')}
        </button>
      </div>

      {view === 'narrative' ? (
        <NarrativeView sections={narrativeSections} />
      ) : (
        <TraditionalView data={data} />
      )}
    </>
  );
}
