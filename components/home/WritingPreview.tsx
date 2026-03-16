'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

// Hardcoded for now — will be replaced with MDX content loading in P3.5
const latestPosts = [
  {
    slug: 'ai-strategy-wrong',
    title: 'Your AI Strategy Is Already Wrong',
    description: 'Most AI strategy writing fails the people who actually have to implement it.',
    date: '2026-02-23',
  },
  {
    slug: 'ai-roadmaps-context-layer',
    title: 'AI Roadmaps Need a Context Layer',
    description: 'Why every AI roadmap should start with the decisions it needs to support.',
    date: '2026-01-15',
  },
  {
    slug: 'the-thermodynamic-wall',
    title: 'The Thermodynamic Wall',
    description: 'AI scaling is hitting a physical wall. The bottleneck isn\'t algorithms — it\'s electrons and heat.',
    date: '2025-12-21',
  },
];

export function WritingPreview() {
  const t = useTranslations('writing');

  return (
    <section className="container-grid py-20 md:py-28">
      <div className="flex items-center justify-between mb-12">
        <h2 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight text-ghost">
          {t('latestHeading')}
        </h2>
      </div>

      <div className="grid gap-6">
        {latestPosts.map((post, i) => (
          <motion.div
            key={post.slug}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
          >
            <Link href={`/writing/${post.slug}`} className="group block">
              <div className="card-hover p-6 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <h3 className="font-heading text-lg font-semibold text-ghost group-hover:text-sapphire transition-colors">
                    {post.title}
                  </h3>
                  <p className="mt-1 text-sm text-steel">{post.description}</p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="font-mono text-xs text-steel">{post.date}</span>
                  <span className="text-sm text-sapphire flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {t('readMore')} <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
