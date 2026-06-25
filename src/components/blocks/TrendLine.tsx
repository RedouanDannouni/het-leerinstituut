import { Card } from "@/components/ui/Card";

const defaultPoints = [42, 52, 49, 61, 66, 72];
const defaultLabels = ["Jan", "Feb", "Mrt", "Apr", "Mei", "Jun"];

const W = 520;
const H = 180;
const PAD = 16;

export interface TrendLineProps {
  title?: string;
  description?: string;
  /** Reeks meetwaarden. Standaard een demo-reeks op schaal 0–100. */
  points?: number[];
  /** Labels onder de x-as; moet even lang zijn als `points`. */
  labels?: string[];
  /** Onder-/bovengrens van de y-as. Standaard 0–100. */
  min?: number;
  max?: number;
}

export function TrendLine({
  title = "Trend",
  description = "Rustige trendweergave met context, geen ranglijsten.",
  points = defaultPoints,
  labels = defaultLabels,
  min = 0,
  max = 100,
}: TrendLineProps) {
  const range = max - min || 1;
  const stepX = (W - PAD * 2) / Math.max(1, points.length - 1);
  const toX = (i: number) => PAD + i * stepX;
  const toY = (v: number) => H - PAD - ((v - min) / range) * (H - PAD * 2);

  const line = points.map((p, i) => `${toX(i)},${toY(p)}`).join(" ");
  const area = `${PAD},${H - PAD} ${line} ${toX(points.length - 1)},${H - PAD}`;
  const last = points.length - 1;

  return (
    <Card>
      <div className="card-header">
        <div>
          <h2>{title}</h2>
          <p className="muted" style={{ margin: 0 }}>
            {description}
          </p>
        </div>
      </div>
      <svg
        role="img"
        aria-label={`${title}: trend over ${points.length} meetmomenten`}
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height="200"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--brand-mint)" stopOpacity="0.32" />
            <stop offset="100%" stopColor="var(--brand-mint)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((g) => (
          <line
            key={g}
            x1={PAD}
            x2={W - PAD}
            y1={PAD + g * (H - PAD * 2)}
            y2={PAD + g * (H - PAD * 2)}
            stroke="var(--color-border)"
            strokeWidth="1"
          />
        ))}
        <polygon points={area} fill="url(#trend-fill)" />
        <polyline
          points={line}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((p, i) => (
          <circle
            key={labels[i] ?? i}
            cx={toX(i)}
            cy={toY(p)}
            r={i === last ? 6 : 4}
            fill={i === last ? "var(--brand-mint)" : "var(--color-surface)"}
            stroke="var(--color-primary)"
            strokeWidth="2.5"
          />
        ))}
      </svg>
      <div className="area-axis" aria-hidden>
        {labels.map((label, i) => (
          <span key={`${label}-${i}`}>{label}</span>
        ))}
      </div>
    </Card>
  );
}
