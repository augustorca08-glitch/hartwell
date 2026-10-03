"use client";

import { Minus, Plus } from "@phosphor-icons/react";

export function QtyStepper({
  value,
  max,
  onChange,
  label,
  size = "md",
}: {
  value: number;
  max: number;
  onChange: (n: number) => void;
  label: string;
  size?: "sm" | "md";
}) {
  const h = size === "sm" ? "h-11" : "h-[50px]";
  const btn = `grid ${size === "sm" ? "w-10" : "w-12"} place-items-center transition-colors hover:bg-ink/[0.05] disabled:opacity-30 disabled:hover:bg-transparent`;
  return (
    <div role="group" aria-label={label} className={`inline-flex ${h} items-stretch shadow-[inset_0_0_0_1px_var(--color-line-strong)]`}>
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Restar uno">
        <Minus size={13} weight="light" aria-hidden />
      </button>
      <output className="numeral grid min-w-8 place-items-center text-sm" aria-live="polite">
        {value}
      </output>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Sumar uno">
        <Plus size={13} weight="light" aria-hidden />
      </button>
    </div>
  );
}
