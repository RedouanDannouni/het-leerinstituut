const points = [42, 52, 49, 61, 66, 72];

export function TrendLine({ title = "Trend" }: { title?: string }) {
  const polyline = points.map((point, index) => `${index * 48},${90 - point}`).join(" ");

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2>{title}</h2>
          <p className="muted">Rustige trendweergave met context, geen ranglijsten.</p>
        </div>
      </div>
      <svg role="img" aria-label={`${title}: stijgende lijn over zes meetmomenten`} viewBox="0 0 260 110" width="100%" height="180">
        <line x1="0" y1="90" x2="250" y2="90" stroke="var(--color-border)" />
        <line x1="0" y1="45" x2="250" y2="45" stroke="var(--color-border)" />
        <polyline points={polyline} fill="none" stroke="var(--color-primary)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((point, index) => (
          <circle key={point + index} cx={index * 48} cy={90 - point} r="5" fill="var(--color-primary)" />
        ))}
      </svg>
    </div>
  );
}
