import Link from "next/link";
import { Button } from "./Button";

export function EmptyState({ title, description, actionHref, actionLabel }: { title: string; description: string; actionHref?: string; actionLabel?: string }) {
  return (
    <div className="card stack" style={{ textAlign: "center", padding: "var(--space-8)" }}>
      <div className="eyebrow">Nog niets te tonen</div>
      <h2>{title}</h2>
      <p className="muted">{description}</p>
      {actionHref && actionLabel ? (
        <p>
          <Button variant="primary" type="button">
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        </p>
      ) : null}
    </div>
  );
}
