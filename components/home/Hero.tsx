'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

export function Hero() {
  const t = useTranslations('hero');

  return (
    <section className="relative overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-obsidian via-obsidian to-midnight" />

      <div className="container-grid relative py-24 md:py-32 lg:py-40">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="max-w-3xl"
        >
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-ghost leading-[1.1]">
            {t('headline')}
          </h1>
          <p className="mt-6 text-lg md:text-xl text-steel font-mono">
            {t('subline')}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
