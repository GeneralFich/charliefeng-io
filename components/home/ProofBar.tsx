'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

export function ProofBar() {
  const t = useTranslations('proof');

  const metrics = [
    t('engineers'),
    t('assets'),
    t('savings'),
    t('fleet'),
  ];

  return (
    <section className="border-y border-silver/10">
      <div className="container-grid py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="card px-4 py-3 text-center"
            >
              <span className="font-mono text-sm text-silver">{metric}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
