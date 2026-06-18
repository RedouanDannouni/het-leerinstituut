import type { ReactNode } from "react";

type Tone = "neutral" | "success" | "warning" | "info" | "danger";

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: Tone }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function statusTone(status: string): Tone {
  if (["afgerond", "completed", "ready", "active", "actief"].includes(status)) return "success";
  if (["concept", "draft", "setup", "gepland"].includes(status)) return "warning";
  if (["risico", "paused"].includes(status)) return "danger";
  return "neutral";
}
