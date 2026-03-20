'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

const principleKeys = ['p1', 'p2', 'p3', 'p4'] as const;

export function HowIThink() {
  const t = useTranslations('thinking');

  return (
    <section className="container-grid py-20 md:py-28">
      <h2 className="font-heading text-2xl md:text-3xl font-semibold tracking-tight text-ghost mb-12">
        {t('heading')}
      </h2>

      <div className="grid sm:grid-cols-2 gap-6">
        {principleKeys.map((key, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="card p-6 border-l-2 border-l-sapphire/40"
          >
            <p className="text-ghost text-base leading-relaxed">
              &ldquo;{t(key)}&rdquo;
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
