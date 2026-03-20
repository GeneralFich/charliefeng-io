interface Metric {
  label: string;
  value: string;
}

export function Snapshot({ metrics }: { metrics: Metric[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
      {metrics.map((m) => (
        <div
          key={m.label}
          className="card px-4 py-4 text-center"
        >
          <div className="font-mono text-xl font-bold text-ghost">{m.value}</div>
          <div className="mt-1 font-mono text-xs uppercase tracking-wider text-steel">
            {m.label}
          </div>
        </div>
      ))}
    </div>
  );
}
