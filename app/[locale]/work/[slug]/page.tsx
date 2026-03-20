import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getCaseStudy, getAllCaseStudies } from '@/lib/mdx';
import { mdxComponents } from '@/components/shared/MDXComponents';
import { CaseStudyHeader } from '@/components/case-study/CaseStudyHeader';
import { Snapshot } from '@/components/case-study/Snapshot';
import { StickySidebar } from '@/components/case-study/StickySidebar';
import remarkGfm from 'remark-gfm';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateStaticParams() {
  const studies = getAllCaseStudies('en');
  return studies.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const study = getCaseStudy(slug, locale);
  if (!study) return {};
  return {
    title: study.meta.title,
    description: `${study.meta.role} at ${study.meta.company} — ${study.meta.dates}`,
  };
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const locale = await getLocale();
  const study = getCaseStudy(slug, locale);

  if (!study) notFound();

  return (
    <div className="container-grid py-16 md:py-24">
      <CaseStudyHeader meta={study.meta} />
      <Snapshot metrics={study.meta.metrics} />

      <div className="grid lg:grid-cols-[1fr_240px] gap-12">
        {/* Main content */}
        <article className="prose-custom max-w-none">
          <MDXRemote
            source={study.content}
            components={mdxComponents}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
              },
            }}
          />
        </article>

        {/* Sticky sidebar */}
        <StickySidebar meta={study.meta} />
      </div>
    </div>
  );
}
