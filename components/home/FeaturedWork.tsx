'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const caseStudies = [
  { slug: 'rivian', key: 'rivian' },
  { slug: 'gemdc', key: 'gemdc' },
  { slug: 'dcai-agent-suite', key: 'dcai' },
] as const;

export function FeaturedWork() {
  const t = useTranslations('featured');

  return (
    <section className="container-grid py-20 md:py-28">
      <h2 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight text-ghost mb-12">
        {t('heading')}
      </h2>

      <div className="grid md:grid-cols-3 gap-6">
        {caseStudies.map((study, i) => (
          <motion.div
            key={study.slug}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <Link href={`/work/${study.slug}`} className="group block h-full">
              <div className="card-hover h-full p-6 flex flex-col">
                <h3 className="font-heading text-xl font-semibold text-ghost group-hover:text-sapphire transition-colors">
                  {t(`${study.key}.title`)}
                </h3>
                <p className="mt-3 text-sm text-steel flex-1">
                  {t(`${study.key}.description`)}
                </p>
                <div className="mt-6 flex items-center gap-1 text-sm text-sapphire font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  {t('cta')}
                  <ArrowRight size={14} />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
