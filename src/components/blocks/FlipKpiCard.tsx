"use client";

import { useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  ClipboardCheck,
  Info,
  Layers,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PlannerSignal, SignalIcon, SignalTrend } from "@/lib/domain/planner";

const iconFor: Record<SignalIcon, LucideIcon> = {
  leskwaliteit: Activity,
  plc: Layers,
  cadans: ClipboardCheck,
  respons: BarChart3,
};

const trendMeta: Record<SignalTrend, { Icon: LucideIcon; label: string }> = {
  up: { Icon: ArrowUpRight, label: "Stijgend" },
  down: { Icon: ArrowDownRight, label: "Daalt" },
  stable: { Icon: ArrowRight, label: "Stabiel" },
};

function formatBarValue(value: number, unit: "score" | "pct"): string {
  return unit === "pct" ? `${Math.round(value)}%` : value.toFixed(1);
}

export function FlipKpiCard({ signal }: { signal: PlannerSignal }) {
  const [flipped, setFlipped] = useState(false);
  const [hinting, setHinting] = useState(false);
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (hintTimer.current) clearTimeout(hintTimer.current);
      if (clickTimer.current) clearTimeout(clickTimer.current);
    };
  }, []);

  const ChipIcon = iconFor[signal.icon];
  const { Icon: TrendIcon, label: trendLabel } = trendMeta[signal.trend];

  function flip() {
    if (clickTimer.current) {
      clearTimeout(clickTimer.current);
      clickTimer.current = null;
    }
    setHinting(false);
    setFlipped((value) => !value);
  }

  function showHint() {
    if (flipped) return;
    if (clickTimer.current) return;
    clickTimer.current = setTimeout(() => {
      setHinting(true);
      if (hintTimer.current) clearTimeout(hintTimer.current);
      hintTimer.current = setTimeout(() => setHinting(false), 1500);
      clickTimer.current = null;
    }, 200);
  }

  return (
    <div
      className={`flip-kpi${flipped ? " is-flipped" : ""}${hinting ? " is-hinting" : ""}`}
      role="button"
      tabIndex={0}
      aria-pressed={flipped}
      aria-label={`${signal.label}: ${signal.value}${signal.unit}. Toets Enter voor de ontleding.`}
      onClick={showHint}
      onDoubleClick={flip}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          flip();
        }
        if (event.key === "Escape" && flipped) {
          event.preventDefault();
          setFlipped(false);
        }
      }}
    >
      <div className="flip-kpi-inner">
        <div className="flip-face flip-face-front">
          <span className="flip-cue" aria-hidden />
          <span className="flip-hint" aria-hidden>
            dubbelklik voor detail
          </span>
          <div className="kpi-top">
            <span className="kpi-icon" data-trend={signal.trend} aria-hidden>
              <ChipIcon size={22} />
            </span>
            <span className="kpi-chip" data-trend={signal.trend}>
              <TrendIcon size={14} aria-hidden />
              {signal.trendLabel}
            </span>
          </div>
          <div className="metric-value">
            {signal.value}
            <small> {signal.unit}</small>
          </div>
          <p className="kpi-label">{signal.label}</p>
          <p className="muted kpi-context flip-kpi-spacer">{signal.context}</p>
          <span className="sr-only">Trend: {trendLabel}</span>
        </div>
        <div className="flip-face flip-face-back">
          <div className="flip-info" tabIndex={flipped ? 0 : -1}>
            <Info size={15} aria-hidden />
            <span className="sr-only">Meer context</span>
            <span className="flip-info-pop" role="tooltip">
              {signal.info}
            </span>
          </div>
          <p className="flip-back-title">{signal.backTitle}</p>
          <div className="flip-bars">
            {signal.bars.map((bar) => {
              const pct = Math.round((bar.value / bar.max) * 100);
              const low = bar.unit === "score" && bar.value < 3.4;
              return (
                <div key={bar.label} className="flip-bar">
                  <span className="flip-bar-label">{bar.label}</span>
                  <div className="progress-track">
                    <div
                      className={`progress-bar${low ? " is-low" : ""}${bar.highlight ? " is-highlight" : ""}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <strong className="flip-bar-value">{formatBarValue(bar.value, bar.unit)}</strong>
                </div>
              );
            })}
          </div>
          <button
            type="button"
            className="flip-back-foot"
            onClick={(event) => {
              event.stopPropagation();
              setFlipped(false);
            }}
          >
            <ArrowLeft size={14} aria-hidden /> terug
          </button>
        </div>
      </div>
    </div>
  );
}
