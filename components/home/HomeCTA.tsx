'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { motion } from 'framer-motion';

export function HomeCTA() {
  const t = useTranslations('cta');

  return (
    <section className="border-t border-silver/10">
      <div className="container-grid py-20 md:py-28 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="font-heading text-xl md:text-2xl font-semibold text-ghost max-w-2xl mx-auto">
            {t('heading')}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/resume"
              className="inline-flex items-center px-6 py-3 bg-sapphire text-ghost text-sm font-medium rounded-lg hover:bg-sapphire/90 transition-colors"
            >
              {t('resume')}
            </Link>
            <a
              href="mailto:charlie@charliefeng.io"
              className="inline-flex items-center px-6 py-3 border border-silver/30 text-ghost text-sm font-medium rounded-lg hover:border-silver/60 transition-colors"
            >
              {t('contact')}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
