import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getEssay, getAllEssays } from '@/lib/mdx';
import { mdxComponents } from '@/components/shared/MDXComponents';
import { Link } from '@/i18n/routing';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateStaticParams() {
  const essays = getAllEssays('en');
  return essays.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const essay = getEssay(slug, locale);
  if (!essay) return {};
  return {
    title: essay.meta.title,
    description: essay.meta.description,
  };
}

export default async function EssayPage({ params }: Props) {
  const { slug } = await params;
  const locale = await getLocale();
  const essay = getEssay(slug, locale);

  if (!essay) notFound();

  // Get all essays for prev/next nav
  const allEssays = getAllEssays(locale);
  const currentIndex = allEssays.findIndex((e) => e.slug === slug);
  const prevEssay = currentIndex < allEssays.length - 1 ? allEssays[currentIndex + 1] : null;
  const nextEssay = currentIndex > 0 ? allEssays[currentIndex - 1] : null;

  return (
    <div className="container-grid py-16 md:py-24">
      <article className="mx-auto max-w-prose">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/writing"
            className="inline-flex items-center gap-1 text-sm text-steel hover:text-ghost transition-colors mb-6"
          >
            <ArrowLeft size={14} /> Back to Writing
          </Link>
          <div className="flex flex-wrap gap-2 mb-4">
            {essay.meta.tags.map((tag) => (
              <span key={tag} className="badge-sapphire">{tag}</span>
            ))}
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold tracking-tight text-ghost">
            {essay.meta.title}
          </h1>
          <div className="mt-4 flex items-center gap-3 font-mono text-sm text-steel">
            <span>{essay.meta.date}</span>
            <span className="text-silver/30">·</span>
            <span>{essay.meta.readTime} min read</span>
          </div>
        </div>

        {/* Content */}
        <div className="prose-custom leading-relaxed">
          <MDXRemote
            source={essay.content}
            components={mdxComponents}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm, remarkMath],
                rehypePlugins: [rehypeKatex as any],
              },
            }}
          />
        </div>

        {/* Prev/Next navigation */}
        <nav className="mt-16 pt-8 border-t border-silver/10 grid grid-cols-2 gap-6">
          {prevEssay ? (
            <Link
              href={`/writing/${prevEssay.slug}`}
              className="group text-left"
            >
              <span className="text-xs font-mono text-steel uppercase tracking-wider">
                Previous
              </span>
              <p className="mt-1 text-sm text-ghost group-hover:text-sapphire transition-colors line-clamp-1">
                {prevEssay.title}
              </p>
            </Link>
          ) : (
            <div />
          )}
          {nextEssay ? (
            <Link
              href={`/writing/${nextEssay.slug}`}
              className="group text-right"
            >
              <span className="text-xs font-mono text-steel uppercase tracking-wider">
                Next
              </span>
              <p className="mt-1 text-sm text-ghost group-hover:text-sapphire transition-colors line-clamp-1">
                {nextEssay.title}
              </p>
            </Link>
          ) : (
            <div />
          )}
        </nav>
      </article>
    </div>
  );
}
