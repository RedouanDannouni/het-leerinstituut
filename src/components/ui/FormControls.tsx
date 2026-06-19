"use client";

import { useEffect, useId, useRef, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";

/**
 * Brand-afgestemde formuliercontrols voor de Kwaliteitsmonitor.
 * Patronen (floating labels, segmented selectors, score-meter) zijn geïnspireerd
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

export function FloatingInput({ label, help, locked, id, className = "", value, ...props }: FloatingInputProps) {
  const reactId = useId();
  const inputId = id ?? reactId;
  // date/time/number tonen altijd een waarde-UI; dwing het label dan omhoog.
  const alwaysFloat = props.type === "date" || props.type === "time" || props.type === "number";
  return (
    <div className={`fl-field ${locked ? "fl-field--locked" : ""} ${alwaysFloat ? "fl-field--float" : ""} ${className}`.trim()}>
      <input
        id={inputId}
        className="fl-field__input"
        placeholder=" "
        value={value}
        readOnly={locked || props.readOnly}
        aria-readonly={locked || undefined}
        {...props}
      />
      <label htmlFor={inputId} className="fl-field__label">
        {label}
      </label>
      {help ? <span className="fl-field__help">{help}</span> : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Segmented selector (vervangt een dropdown bij weinig opties)
// ---------------------------------------------------------------------------

interface SegmentedFieldProps {
  label: string;
  name: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  help?: string;
  /** Optioneel: laat de gekozen optie weer leegklikken. */
  clearable?: boolean;
}

export function SegmentedField({ label, name, options, value, onChange, help, clearable = true }: SegmentedFieldProps) {
  return (
    <fieldset className="seg-field">
      <legend className="seg-field__label">{label}</legend>
      <div className="seg" role="radiogroup" aria-label={label}>
        {options.map((option) => {
          const checked = value === option;
          return (
            <label key={option} className={`seg__option ${checked ? "seg__option--active" : ""}`.trim()}>
              <input
                className="seg__input"
                type="radio"
                name={name}
                value={option}
                checked={checked}
                onChange={() => onChange(option)}
                onClick={() => {
                  if (clearable && checked) onChange("");
                }}
              />
              <span className="seg__dot" aria-hidden />
              <span className="seg__text">{option}</span>
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
    <div className={`meter meter--${options.length}`}>
      <div className="meter__track" role="radiogroup" aria-label={ariaLabel}>
        {options.map((option) => {
          const checked = value === option.value;
          const filled = value != null && option.value <= value;
          return (
            <label
              key={option.value}
              className={`meter__seg meter__seg--${option.value} ${filled ? "is-filled" : ""} ${checked ? "is-active" : ""}`.trim()}
              title={option.description ?? option.label}
            >
              <input
                className="meter__input"
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
              />
              <span className="meter__num">{option.value}</span>
            </label>
          );
        })}
      </div>
      <div className="meter__caption" aria-live="polite">
        {selected ? (
          <>
            <strong className="meter__caption-label">{selected.label}</strong>
            {selected.description ? <span className="meter__caption-desc"> — {selected.description}</span> : null}
          </>
        ) : (
          <span className="meter__caption-empty">Kies een score</span>
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
