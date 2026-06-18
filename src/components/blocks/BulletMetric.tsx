export function BulletMetric({ label, value, target }: { label: string; value: number; target: number }) {
  const width = Math.min(100, Math.round((value / target) * 100));

  return (
    <div className="stack" style={{ gap: "var(--space-2)" }}>
      <div className="cluster" style={{ justifyContent: "space-between" }}>
        <strong>{label}</strong>
        <span className="muted">
          {value}/{target}
        </span>
      </div>
      <div className="progress-track" aria-label={`${label}: ${value} van ${target}`}>
        <div className="progress-bar" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}
