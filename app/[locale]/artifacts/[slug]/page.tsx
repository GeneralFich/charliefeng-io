import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getArtifact, getAllArtifacts } from '@/lib/mdx';
import { mdxComponents } from '@/components/shared/MDXComponents';
import { Link } from '@/i18n/routing';
import { ArrowLeft } from 'lucide-react';
import remarkGfm from 'remark-gfm';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateStaticParams() {
  const artifacts = getAllArtifacts('en');
  return artifacts.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;
  const artifact = getArtifact(slug, locale);
  if (!artifact) return {};
  return {
    title: artifact.meta.title,
    description: artifact.meta.description,
  };
}

const typeColors: Record<string, string> = {
  Framework: 'badge-sapphire',
  'Decision Doc': 'badge-emerald',
  PRD: 'badge-ruby',
  Strategy: 'badge-steel',
};

export default async function ArtifactPage({ params }: Props) {
  const { slug } = await params;
  const locale = await getLocale();
  const artifact = getArtifact(slug, locale);

  if (!artifact) notFound();

  return (
    <div className="container-grid py-16 md:py-24">
      <article className="mx-auto max-w-prose">
        <Link
          href="/artifacts"
          className="inline-flex items-center gap-1 text-sm text-steel hover:text-ghost transition-colors mb-6"
        >
          <ArrowLeft size={14} /> Back to Artifacts
        </Link>

        {/* Context callout */}
        {artifact.meta.context && (
          <div className="card p-4 mb-8 border-l-2 border-l-sapphire/40">
            <div className="font-mono text-xs uppercase tracking-wider text-steel mb-1">
              Context
            </div>
            <p className="text-sm text-ghost/80">{artifact.meta.context}</p>
          </div>
        )}

        <div className="mb-8">
          <span className={typeColors[artifact.meta.type] || 'badge-steel'}>
            {artifact.meta.type}
          </span>
          <h1 className="mt-4 font-heading text-3xl md:text-4xl font-bold tracking-tight text-ghost">
            {artifact.meta.title}
          </h1>
          <div className="mt-3 font-mono text-sm text-steel">
            {artifact.meta.readTime} min read
          </div>
        </div>

        <div className="prose-custom font-mono leading-relaxed">
          <MDXRemote
            source={artifact.content}
            components={mdxComponents}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
              },
            }}
          />
        </div>
      </article>
    </div>
  );
}
