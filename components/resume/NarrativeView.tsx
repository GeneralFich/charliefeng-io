import type { NarrativeSection } from '@/lib/resume';
import { useTranslations } from 'next-intl';

export function NarrativeView({ sections }: { sections: NarrativeSection[] }) {
  const t = useTranslations('resume.capabilities');

  return (
    <div className="space-y-10">
      {sections.map((section) => (
        <div key={section.capabilityKey} className="card p-6 border-l-2 border-l-sapphire/40">
          <h3 className="font-heading text-lg font-semibold text-ghost mb-4">
            {t(section.capabilityKey)}
          </h3>
          <ul className="space-y-4">
            {section.evidence.map((item, i) => (
              <li key={i} className="flex gap-3">
                <span className="shrink-0 font-mono text-xs text-sapphire mt-1.5 w-16">
                  {item.source}
                </span>
                <span
                  className="text-sm text-ghost/90 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: item.text
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-ghost font-semibold">$1</strong>'),
                  }}
                />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
