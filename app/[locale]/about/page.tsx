import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'Charlie Feng — Product Leader building AI systems for complex infrastructure.',
};

export default async function AboutPage() {
  const t = await getTranslations('about');

  return (
    <div className="container-grid py-20 md:py-28">
      <h1 className="font-heading text-3xl md:text-4xl font-bold tracking-tight text-ghost mb-12">
        {t('heading')}
      </h1>

      <div className="max-w-prose space-y-16">
        {/* Bio */}
        <section className="space-y-4 text-ghost/90 leading-relaxed">
          <p>
            I build products for complex systems. My work sits at the intersection of AI, infrastructure, and product strategy — turning technical constraints into software that helps people make better decisions at scale.
          </p>
          <p>
            At Google, I lead product for data center infrastructure tools used by thousands of engineers managing one of the world&apos;s largest compute fleets. I&apos;ve built AI-powered platforms that ingest 150k+ technical assets, defined the product vision for a Climate Intelligence system that captured $50M+ in efficiency gains, and launched agentic AI tools that automate operational workflows across 3,100+ person organizations.
          </p>
          <p>
            Before Google, I was a Senior Product Manager at Amazon, where I owned the technical integration strategy for Amazon&apos;s custom Rivian EV fleet — scaling from 4 vehicles to 100+ across North America. I also built real-time observability products and shipped features for 100,000+ delivery drivers.
          </p>
          <p>
            I hold an MBA from Yale School of Management and a BS in Finance, Computer Science &amp; Mathematics from NYU Stern. I bring equal comfort discussing transformer architectures, capacity planning models, and go-to-market strategy.
          </p>
        </section>

        {/* What I'm exploring */}
        <section>
          <h2 className="font-heading text-xl font-semibold text-ghost mb-6">
            {t('exploring')}
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              'AI infrastructure products that serve engineering teams',
              'Internal platforms as real products (not afterthoughts)',
              'Decision automation for high-stakes operational environments',
              'Product leadership in deeply technical organizations',
            ].map((item) => (
              <div key={item} className="card p-4 border-l-2 border-l-sapphire/30">
                <p className="text-sm text-ghost/90">{item}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Outside work */}
        <section>
          <h2 className="font-heading text-xl font-semibold text-ghost mb-6">
            {t('outside')}
          </h2>
          <div className="space-y-4 text-ghost/90 leading-relaxed">
            <p>
              I shoot with a Leica Q3 43 — mostly street photography, architectural details, and Pacific Northwest landscapes. The constraint of a fixed 43mm lens forces compositional discipline that I find carries over into product thinking.
            </p>
            <p>
              I cook on a Big Green Egg, where the combination of precise temperature control and long cook times is its own form of systems thinking. And I maintain a structured fitness routine that keeps me sharp for the intensity of building products at scale.
            </p>
          </div>

          {/* Photo gallery placeholder */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[4/3] bg-charcoal border border-silver/10 rounded-lg flex items-center justify-center"
              >
                <span className="font-mono text-xs text-steel/40">Photo {i + 1}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 font-mono text-xs text-steel">
            [PLACEHOLDER: Add 6 curated photos from Leica Q3 43]
          </p>
        </section>
      </div>
    </div>
  );
}
