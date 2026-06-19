"use client";

import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import type { BlockType } from "@/lib/lessons/types";
import { blockGroupLabels, blockGroupOrder, blocksByGroup } from "./block-registry";

export function BlockInserter({ onInsert, variant = "line" }: { onInsert: (type: BlockType) => void; variant?: "line" | "button" }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const insert = (type: BlockType) => {
    onInsert(type);
    setOpen(false);
    setQuery("");
  };

  return (
    <div className={`block-inserter block-inserter--${variant}`} ref={containerRef}>
      {variant === "line" ? (
        <button type="button" className="block-inserter-line" aria-label="Blok toevoegen" onClick={() => setOpen((value) => !value)}>
          <span className="block-inserter-plus">
            <Plus size={16} aria-hidden />
          </span>
        </button>
      ) : (
        <button type="button" className="btn btn-primary" onClick={() => setOpen((value) => !value)}>
          <Plus size={16} aria-hidden /> Blok toevoegen
        </button>
      )}

      {open ? (
        <div className="block-menu" role="menu">
          <input
            autoFocus
            className="input block-menu-search"
            placeholder="Zoek een blok of typ /…"
            value={query}
            onChange={(event) => setQuery(event.target.value.replace(/^\//, ""))}
          />
          <div className="block-menu-scroll">
            {blockGroupOrder.map((group) => {
              const items = blocksByGroup(group).filter(
                (definition) =>
                  !query ||
                  definition.label.toLowerCase().includes(query.toLowerCase()) ||
                  definition.description.toLowerCase().includes(query.toLowerCase()),
              );
              if (!items.length) return null;
              return (
                <div className="block-menu-group" key={group}>
                  <p className="block-menu-label">{blockGroupLabels[group]}</p>
                  {items.map((definition) => {
                    const Icon = definition.icon;
                    return (
                      <button key={definition.type} type="button" className="block-menu-item" role="menuitem" onClick={() => insert(definition.type)}>
                        <span className="block-menu-icon" aria-hidden>
                          <Icon size={17} />
                        </span>
                        <span className="block-menu-text">
                          <strong>{definition.label}</strong>
                          <span className="muted">{definition.description}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
