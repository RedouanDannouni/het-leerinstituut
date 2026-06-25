"use client";

import { useEffect, useId, useRef, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";

/**
 * Brand-afgestemde formuliercontrols voor de Kwaliteitsmonitor.
 * Patronen (floating labels, verticale radioknoppen, score-meter) zijn geïnspireerd
 * op moderne controls, maar gebonden aan de bestaande design tokens zodat
 * light/dark en de huisstijl automatisch kloppen.
 */

// ---------------------------------------------------------------------------
// Floating-label tekstveld (text/email/date/time/number)
// ---------------------------------------------------------------------------

interface FloatingInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "placeholder"> {
  label: string;
  help?: string;
  /** Toont een slotje + subtiele 'voorgevuld' stijl. */
  locked?: boolean;
}

export function FloatingInput({ label, help, locked, id, className = "", value, onChange, readOnly, ...props }: FloatingInputProps) {
  const reactId = useId();
  const inputId = id ?? reactId;
  const isReadOnly = locked || readOnly;
  return (
    <div className={`fl-field fl-field--float ${locked ? "fl-field--locked" : ""} ${className}`.trim()}>
      <input
        id={inputId}
        className="fl-field__input"
        placeholder=" "
        value={value}
        {...props}
        readOnly={isReadOnly}
        aria-readonly={isReadOnly || undefined}
        onChange={isReadOnly ? undefined : onChange}
      />
      <label htmlFor={inputId} className="fl-field__label">
        {label}
      </label>
      {help ? <span className="fl-field__help">{help}</span> : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Verticale radioknoppen (keuzevelden met weinig opties)
// ---------------------------------------------------------------------------

interface RadioFieldProps {
  label: string;
  name: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  help?: string;
  /** Optioneel: laat de gekozen optie weer leegklikken. */
  clearable?: boolean;
  /** Alleen-lezen tonen (geen wijziging mogelijk). */
  locked?: boolean;
}

export function RadioField({ label, name, options, value, onChange, help, clearable = true, locked = false }: RadioFieldProps) {
  const groupId = useId();
  return (
    <fieldset className={`radio-field ${locked ? "radio-field--locked" : ""}`.trim()}>
      <legend className="radio-field__label">{label}</legend>
      <div className="radio-list" role="radiogroup" aria-label={label} aria-readonly={locked || undefined}>
        {options.map((option, index) => {
          const checked = value === option;
          const inputId = `${groupId}-${index}`;
          return (
            <label key={option} className="radio" htmlFor={inputId}>
              <input
                id={inputId}
                className="radio__input"
                type="radio"
                name={name}
                value={option}
                checked={checked}
                disabled={locked}
                onChange={() => onChange(option)}
                onClick={() => {
                  if (!locked && clearable && checked) onChange("");
                }}
              />
              <span className="radio__dot" aria-hidden="true" />
              <span className="radio__text">{option}</span>
            </label>
          );
        })}
      </div>
      {help ? <span className="fl-field__help">{help}</span> : null}
    </fieldset>
  );
}

// ---------------------------------------------------------------------------
// Score-meter (het hart van de vragenlijst): kleurgecodeerde segmenten
// ---------------------------------------------------------------------------

export interface MeterOption {
  value: number;
  label: string;
  description?: string;
}

interface ScaleMeterProps {
  name: string;
  options: MeterOption[];
  value: number | null | undefined;
  onChange: (value: number) => void;
  ariaLabel: string;
}

export function ScaleMeter({ name, options, value, onChange, ariaLabel }: ScaleMeterProps) {
  const selected = options.find((option) => option.value === value) ?? null;
  return (
    <div className="segscale">
      <div className="segscale__track" role="radiogroup" aria-label={ariaLabel}>
        {options.map((option) => {
          const checked = value === option.value;
          return (
            <label
              key={option.value}
              className={`segscale__seg ${checked ? "is-active" : ""}`.trim()}
              title={option.description ?? option.label}
            >
              <input
                className="segscale__input"
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
              />
              <span className="segscale__num">{option.value}</span>
            </label>
          );
        })}
      </div>
      <div className="segscale__caption" aria-live="polite">
        {selected ? (
          <>
            <strong className="segscale__caption-label">{selected.label}</strong>
            {selected.description ? (
              <span className="segscale__caption-desc"> — {selected.description}</span>
            ) : null}
          </>
        ) : (
          <span className="segscale__caption-empty">Kies een score</span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Auto-groeiende textarea met optionele teller
// ---------------------------------------------------------------------------

interface AutoTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  help?: ReactNode;
}

export function AutoTextarea({ label, help, value, className = "", id, onChange, ...props }: AutoTextareaProps) {
  const reactId = useId();
  const areaId = id ?? reactId;
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <div className="autoarea-field">
      {label ? (
        <label htmlFor={areaId} className="label">
          {label}
        </label>
      ) : null}
      <textarea
        id={areaId}
        ref={ref}
        className={`textarea autoarea ${className}`.trim()}
        value={value}
        onChange={onChange}
        rows={2}
        {...props}
      />
      {help ? <span className="help-text">{help}</span> : null}
    </div>
  );
}
