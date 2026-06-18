import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";

export function ActionList({ title, items }: { title: string; items: string[] }) {
  return (
    <Card>
      <h2>{title}</h2>
      <div className="stack">
        {items.map((item) => (
          <div className="cluster" key={item} style={{ alignItems: "flex-start" }}>
            <CheckCircle2 aria-hidden color="var(--color-success)" size={20} />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
