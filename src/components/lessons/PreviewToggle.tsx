"use client";

import { Monitor, Smartphone, Tablet } from "lucide-react";

export type PreviewDevice = "desktop" | "tablet" | "mobile";

const devices: { id: PreviewDevice; label: string; icon: React.ElementType }[] = [
  { id: "desktop", label: "Desktop", icon: Monitor },
  { id: "tablet", label: "Tablet", icon: Tablet },
  { id: "mobile", label: "Mobiel", icon: Smartphone },
];

export function PreviewToggle({ device, onChange }: { device: PreviewDevice; onChange: (device: PreviewDevice) => void }) {
  return (
    <div className="device-toggle" role="group" aria-label="Voorbeeldweergave">
      {devices.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          className={`device-toggle-btn ${device === id ? "is-active" : ""}`}
          aria-pressed={device === id}
          title={label}
          onClick={() => onChange(id)}
        >
          <Icon size={16} aria-hidden />
          <span className="device-toggle-label">{label}</span>
        </button>
      ))}
    </div>
  );
}
