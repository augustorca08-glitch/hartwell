"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { Plus, X, Check } from "@phosphor-icons/react";
import { type Product, ONE_SIZE, isOneSize, productImage, stockOf } from "@/content/products";
import { useCart } from "@/lib/cart";
import { useFocusTrap, useScrollLock } from "@/lib/dom";
import { formatPrice } from "@/lib/site";
import { EASE } from "@/components/ui/motion";
import { SizeChips, Swatches } from "./variant-pickers";

/** Barra de talles sobre la lámina (desktop, hover o foco). Agrega con el color elegido. */
export function QuickAddInline({ product, colorId }: { product: Product; colorId: string }) {
  const add = useCart((s) => s.add);
  const [added, setAdded] = useState<string | null>(null);
  const one = isOneSize(product);
  return (
    <div className={`flex flex-wrap items-center gap-1 px-3 py-2.5 bg-paper/95 text-ink shadow-[inset_0_0_0_1px_var(--color-line)] backdrop-blur-sm`}>
      <span className="label mr-2 text-ink-soft">Agregar</span>
      {product.sizes.map((s) => {
        const out = stockOf(product, colorId, s) === 0;
        return (
          <button
            key={s}
            type="button"
            disabled={out}
            onClick={(e) => {
              e.preventDefault();
              add(product.slug, colorId, s);
              setAdded(s);
              window.setTimeout(() => setAdded(null), 1600);
            }}
            aria-label={out ? `Talle ${s} agotado` : `Agregar ${product.name}, ${one ? "talle único" : `talle ${s}`}`}
            className="numeral grid h-9 min-w-9 place-items-center px-2 text-xs transition-colors duration-300 hover:bg-navy hover:text-paper disabled:text-taupe disabled:line-through disabled:hover:bg-transparent"
          >
            {added === s ? <Check size={14} weight="light" aria-hidden /> : s === ONE_SIZE ? "Talle único" : s}
          </button>
        );
      })}
      <span className="sr-only" aria-live="polite">
        {added ? `${product.name} agregado a la bolsa` : ""}
      </span>
    </div>
  );
}

/** Hoja inferior de variantes (mobile y táctil). */
export function QuickAddSheet({ product, initialColor }: { product: Product; initialColor: string }) {
  const [open, setOpen] = useState(false);
  const [color, setColor] = useState(initialColor);
  const one = isOneSize(product);
  const [size, setSize] = useState<string | null>(one ? ONE_SIZE : null);
  const [error, setError] = useState(false);
  const add = useCart((s) => s.add);
  const ref = useRef<HTMLDivElement>(null);
  const close = () => setOpen(false);
  useFocusTrap(ref, open, close);
  useScrollLock(open);

  const colorName = product.colors.find((c) => c.id === color)?.name;

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setOpen(true);
        }}
        aria-label={`Agregar ${product.name} a la bolsa`}
        className="grid h-11 w-11 place-items-center bg-paper/95 text-ink shadow-[inset_0_0_0_1px_var(--color-line)] transition-colors active:bg-cream"
      >
        <Plus size={18} weight="light" aria-hidden />
      </button>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center md:items-center">
            <motion.div className="absolute inset-0 bg-navy-deep/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close} aria-hidden />
            <motion.div
              ref={ref}
              role="dialog"
              aria-modal="true"
              aria-labelledby={`qa-${product.slug}`}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.6, ease: EASE }}
              className="relative w-full max-w-lg bg-paper p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] text-ink"
            >
              <div className="flex gap-4">
                <div className="relative aspect-[4/5] w-24 shrink-0 overflow-hidden bg-ivory">
                  <Image src={productImage(product.slug, color, 1)} alt="" fill sizes="96px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 id={`qa-${product.slug}`} className="font-serif text-2xl leading-tight">
                    {product.name}
                  </h2>
                  <p className="numeral mt-1 text-sm">{formatPrice(product.price)}</p>
                </div>
                <button type="button" onClick={close} aria-label="Cerrar" data-autofocus className="-mr-2 -mt-2 grid h-11 w-11 shrink-0 place-items-center">
                  <X size={18} weight="light" aria-hidden />
                </button>
              </div>
              <fieldset className="mt-6">
                <legend className="text-sm">
                  Color: <span className="text-ink-soft">{colorName}</span>
                </legend>
                <Swatches
                  product={product}
                  value={color}
                  onChange={(c) => {
                    setColor(c);
                    if (!one) setSize(null);
                  }}
                  name={`qa-color-${product.slug}`}
                  className="mt-3"
                />
              </fieldset>
              <fieldset className="mt-6">
                <legend className="text-sm">Talle</legend>
                <SizeChips
                  product={product}
                  colorId={color}
                  value={size}
                  onChange={(s) => {
                    setSize(s);
                    setError(false);
                  }}
                  name={`qa-size-${product.slug}`}
                  className="mt-3"
                />
                {error && (
                  <p role="alert" className="mt-3 text-sm text-oxblood">
                    Elegir un talle para agregar a la bolsa.
                  </p>
                )}
              </fieldset>
              <button
                type="button"
                className="btn mt-7 w-full"
                onClick={() => {
                  if (!size || stockOf(product, color, size) === 0) return setError(true);
                  add(product.slug, color, size);
                  close();
                }}
              >
                Agregar a la bolsa
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
