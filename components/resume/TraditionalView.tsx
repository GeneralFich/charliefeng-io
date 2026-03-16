import type { ResumeData } from '@/lib/resume';
import { useTranslations } from 'next-intl';

export function TraditionalView({ data }: { data: ResumeData }) {
  const t = useTranslations('resume');

  return (
    <div id="resume-traditional" className="space-y-12">
      {/* Summary */}
      <div>
        <h2 className="font-heading text-2xl font-bold text-ghost">{data.name}</h2>
        <p className="mt-1 font-mono text-sm text-steel">{data.title} · {data.location}</p>
        <p className="mt-4 text-sm text-ghost/90 leading-relaxed">{data.summary}</p>
      </div>

      {/* Experience */}
      <div>
        <h3 className="font-mono text-xs uppercase tracking-widest text-steel mb-6 pb-2 border-b border-silver/10">
          Experience
        </h3>
        <div className="space-y-8">
          {data.experience.map((exp) => (
            <div key={exp.company + exp.role}>
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                <div>
                  <span className="font-heading font-semibold text-ghost">{exp.company}</span>
                  <span className="text-steel mx-2">·</span>
                  <span className="text-sm text-ghost/80">{exp.role}</span>
                </div>
                <span className="font-mono text-xs text-steel shrink-0">{exp.dates}</span>
              </div>
              <ul className="mt-3 space-y-2">
                {exp.bullets.map((bullet, i) => (
                  <li
                    key={i}
                    className="text-sm text-ghost/90 leading-relaxed pl-4 relative before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-silver/30"
                    dangerouslySetInnerHTML={{
                      __html: bullet.replace(
                        /\*\*(.*?)\*\*/g,
                        '<strong class="text-ghost font-semibold">$1</strong>'
                      ),
                    }}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div>
        <h3 className="font-mono text-xs uppercase tracking-widest text-steel mb-6 pb-2 border-b border-silver/10">
          Education
        </h3>
        <div className="space-y-4">
          {data.education.map((edu) => (
            <div key={edu.school}>
              <div className="font-heading font-semibold text-ghost">{edu.school}</div>
              <div className="text-sm text-ghost/80">{edu.degree}</div>
              {edu.details && (
                <p className="mt-1 text-xs text-steel">{edu.details}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Leadership */}
      {data.leadership && data.leadership.length > 0 && (
        <div>
          <h3 className="font-mono text-xs uppercase tracking-widest text-steel mb-6 pb-2 border-b border-silver/10">
            Leadership & Community
          </h3>
          <div className="space-y-4">
            {data.leadership.map((item) => (
              <div key={item.organization}>
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                  <div>
                    <span className="font-heading font-semibold text-ghost">{item.organization}</span>
                    <span className="text-steel mx-2">·</span>
                    <span className="text-sm text-ghost/80">{item.role}</span>
                  </div>
                  <span className="font-mono text-xs text-steel">{item.dates}</span>
                </div>
                <p className="mt-1 text-sm text-ghost/90">{item.details}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      <div>
        <h3 className="font-mono text-xs uppercase tracking-widest text-steel mb-6 pb-2 border-b border-silver/10">
          {t('skills')}
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {data.skills.map((cat) => (
            <div key={cat.category}>
              <div className="font-mono text-xs text-sapphire mb-1">{cat.category}</div>
              <div className="text-sm text-ghost/80">{cat.items}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
