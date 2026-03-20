import type { CaseStudyMeta } from '@/lib/mdx';

export function CaseStudyHeader({ meta }: { meta: CaseStudyMeta }) {
  return (
    <div className="mb-12">
      <div className="flex flex-wrap gap-2 mb-4">
        {meta.tags.map((tag) => (
          <span key={tag} className="badge-sapphire">{tag}</span>
        ))}
      </div>
      <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-ghost">
        {meta.title}
      </h1>
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-sm text-steel">
        <span>{meta.role}</span>
        <span className="text-silver/30">|</span>
        <span>{meta.company}</span>
        <span className="text-silver/30">|</span>
        <span>{meta.dates}</span>
        {meta.teamSize && (
          <>
            <span className="text-silver/30">|</span>
            <span>Team: {meta.teamSize}</span>
          </>
        )}
      </div>
    </div>
  );
}
