import type { CaseStudyMeta } from '@/lib/mdx';

export function StickySidebar({ meta }: { meta: CaseStudyMeta }) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-20 space-y-6">
        <SidebarSection label="Role" value={meta.role} />
        <SidebarSection label="Company" value={meta.company} />
        <SidebarSection label="Timeline" value={meta.dates} />
        {meta.teamSize && <SidebarSection label="Team" value={meta.teamSize} />}

        {meta.skills.length > 0 && (
          <div>
            <div className="font-mono text-xs uppercase tracking-wider text-steel mb-2">
              Skills
            </div>
            <div className="flex flex-wrap gap-1.5">
              {meta.skills.map((skill) => (
                <span key={skill} className="badge-steel text-xs">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

function SidebarSection({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-xs uppercase tracking-wider text-steel mb-1">
        {label}
      </div>
      <div className="text-sm text-ghost">{value}</div>
    </div>
  );
}
