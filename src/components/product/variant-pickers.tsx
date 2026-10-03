"use client";

import { type Product, stockOf } from "@/content/products";

/** Muestras de tela como radio group nativo: teclado y lectores de pantalla sin trabajo extra. */
export function Swatches({
  product,
  value,
  onChange,
  name,
  className = "",
  size = "md",
}: {
  product: Product;
  value: string;
  onChange: (id: string) => void;
  name: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "h-8 w-8" : "h-11 w-11";
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {product.colors.map((c) => (
        <label key={c.id} className="relative cursor-pointer" title={c.name}>
          <input type="radio" name={name} value={c.id} checked={value === c.id} onChange={() => onChange(c.id)} className="peer sr-only" />
          <span className="sr-only">{c.name}</span>
          <span
            aria-hidden
            className={`block ${dim} shadow-[inset_0_0_0_1px_rgb(28_29_33_/_0.18)] outline outline-1 outline-offset-[3px] outline-transparent transition-[outline-color] duration-500 hover:outline-line-strong peer-checked:outline-ink peer-focus-visible:outline-2 peer-focus-visible:outline-navy`}
            style={{ background: c.hex }}
          />
        </label>
      ))}
    </div>
  );
}

/** Talles: los agotados se tachan y no se pueden elegir. */
export function SizeChips({
  product,
  colorId,
  value,
  onChange,
  name,
  className = "",
}: {
  product: Product;
  colorId: string;
  value: string | null;
  onChange: (s: string) => void;
  name: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {product.sizes.map((s) => {
        const stock = stockOf(product, colorId, s);
        const out = stock === 0;
        const selected = value === s;
        return (
          <label key={s} className={`relative ${out ? "cursor-not-allowed" : "cursor-pointer"}`}>
            <input type="radio" name={name} value={s} checked={selected} disabled={out} onChange={() => onChange(s)} className="peer sr-only" />
            <span
              className={`numeral grid h-12 min-w-14 place-items-center px-3 text-sm transition-colors duration-500 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-navy ${
                selected
                  ? "bg-navy text-paper"
                  : out
                    ? "bg-[linear-gradient(to_top_right,transparent_calc(50%-0.5px),var(--color-line-strong)_50%,transparent_calc(50%+0.5px))] text-taupe shadow-[inset_0_0_0_1px_var(--color-line)]"
                    : "shadow-[inset_0_0_0_1px_var(--color-line-strong)] hover:shadow-[inset_0_0_0_1px_var(--color-ink)]"
              }`}
            >
              {s}
            </span>
            <span className="sr-only">{out ? " (agotado)" : stock <= 2 ? ` (quedan ${stock})` : ""}</span>
          </label>
        );
      })}
    </div>
  );
}
