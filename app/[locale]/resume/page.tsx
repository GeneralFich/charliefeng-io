import { getLocale, getTranslations } from 'next-intl/server';
import { getResumeData, getNarrativeSections } from '@/lib/resume';
import { ResumeClient } from '@/components/resume/ResumeClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Resume',
  description: 'Charlie Feng — Product Leader at Google. Experience in AI systems, infrastructure, and scaling operations.',
};

export default async function ResumePage() {
  const locale = await getLocale();
  const t = await getTranslations('resume');
  const data = getResumeData(locale);
  const narrativeSections = getNarrativeSections(data);

  return (
    <div className="container-grid py-20 md:py-28">
      <h1 className="font-heading text-3xl md:text-4xl font-bold tracking-tight text-ghost mb-4">
        {t('heading')}
      </h1>

      <ResumeClient data={data} narrativeSections={narrativeSections} />
    </div>
  );
}
