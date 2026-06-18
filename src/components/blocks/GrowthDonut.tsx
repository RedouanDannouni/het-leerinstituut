export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

export function GrowthDonut({
  segments,
  centerValue,
  centerLabel,
}: {
  segments: DonutSegment[];
  centerValue: string;
  centerLabel: string;
}) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0) || 1;

  let cursor = 0;
  const stops = segments
    .map((segment) => {
      const start = (cursor / total) * 100;
      cursor += segment.value;
      const end = (cursor / total) * 100;
      return `${segment.color} ${start}% ${end}%`;
    })
    .join(", ");

  return (
    <div className="donut-wrap">
      <div
        className="donut"
        role="img"
        aria-label={segments.map((segment) => `${segment.label}: ${segment.value}`).join(", ")}
        style={{ background: `conic-gradient(${stops})` }}
      >
        <div className="donut-hole">
          <span className="donut-value">{centerValue}</span>
          <span className="donut-label">{centerLabel}</span>
        </div>
      </div>
      <ul className="donut-legend">
        {segments.map((segment) => (
          <li key={segment.label}>
            <span className="legend-dot" style={{ background: segment.color }} aria-hidden />
            <span>{segment.label}</span>
            <strong>{segment.value}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
