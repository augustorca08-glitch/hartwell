"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeferredValue, useId, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, X } from "@phosphor-icons/react";
import { categories, productImage, productsByCategory } from "@/content/products";
import { SEARCH_SUGGESTIONS, searchProducts } from "@/lib/search";
import { formatPrice } from "@/lib/site";
import { useFocusTrap, useScrollLock } from "@/lib/dom";
import { EASE, EASE_UNVEIL } from "@/components/ui/motion";

/** Panel de búsqueda: resultados mientras se escribe, Enter abre la página completa. */
export function SearchPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, open, onClose);
  useScrollLock(open);
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60]">
          <motion.div
            className="absolute inset-0 bg-navy-deep/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            ref={ref}
            id="search-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Buscar en HARTWELL"
            initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
            transition={{ duration: 0.75, ease: EASE_UNVEIL }}
            className="absolute inset-x-0 top-0 max-h-[100dvh] overflow-y-auto overscroll-contain bg-paper shadow-[0_40px_80px_-40px_rgb(17_27_44_/_0.45)]"
            data-lenis-prevent
          >
            <SearchBody onClose={onClose} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function SearchBody({ onClose }: { onClose: () => void }) {
  const id = useId();
  const router = useRouter();
  const [q, setQ] = useState("");
  const deferred = useDeferredValue(q);
  const results = useMemo(() => searchProducts(deferred), [deferred]);
  const shown = results.slice(0, 6);
  const active = deferred.trim().length > 1;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    onClose();
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-12 pt-5 md:px-10 md:pb-16">
      <div className="flex items-center justify-between">
        <p className="smallcaps text-sm text-ink-soft">Buscar en la Casa</p>
        <button type="button" onClick={onClose} className="-mr-2 flex h-11 items-center gap-2 px-2 text-sm text-ink hover:text-navy" aria-label="Cerrar búsqueda">
          <span className="label hidden sm:inline">Cerrar</span>
          <X size={20} weight="light" aria-hidden />
        </button>
      </div>

      <form role="search" action="/search" onSubmit={submit} className="mt-6 md:mt-10">
        <label htmlFor={`${id}-q`} className="label block text-ink-soft">
          Prenda, tela o color
        </label>
        <div className="mt-3 flex items-end gap-4 border-b border-ink pb-2">
          <input
            id={`${id}-q`}
            name="q"
            type="search"
            data-autofocus
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="display min-w-0 flex-1 bg-transparent text-[clamp(2rem,5vw,3.6rem)] text-ink outline-none placeholder:text-taupe [&::-webkit-search-cancel-button]:hidden"
            placeholder="Lino, cashmere, navy…"
            aria-describedby={`${id}-status`}
          />
          <button type="submit" className="mb-2 grid h-11 w-11 shrink-0 place-items-center text-ink hover:text-navy" aria-label="Ver resultados">
            <ArrowRight size={26} weight="light" aria-hidden />
          </button>
        </div>
      </form>

      <p id={`${id}-status`} className="mt-4 min-h-6 text-sm text-ink-soft" aria-live="polite">
        {active ? (results.length ? `${results.length} ${results.length === 1 ? "pieza encontrada" : "piezas encontradas"}` : "Sin resultados. Probar con otra prenda, tela o color.") : ""}
      </p>

      {active && shown.length > 0 ? (
        <div className="mt-6">
          <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
            {shown.map((p, i) => (
              <motion.li key={p.slug} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: i * 0.05, ease: EASE }}>
                <Link href={`/product/${p.slug}`} onClick={onClose} className="group block">
                  <span className="relative block aspect-[4/5] overflow-hidden bg-ivory">
                    <Image src={productImage(p.slug, p.colors[0].id, 1)} alt="" fill sizes="(min-width: 1024px) 14vw, 45vw" className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-quiet)] group-hover:scale-[1.04]" />
                  </span>
                  <span className="mt-3 block font-serif text-lg leading-tight group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">{p.name}</span>
                  <span className="numeral mt-1 block text-sm text-ink-soft">{formatPrice(p.price)}</span>
                </Link>
              </motion.li>
            ))}
          </ul>
          <Link href={`/search?q=${encodeURIComponent(deferred.trim())}`} onClick={onClose} className="btn btn-line mt-10">
            Ver los {results.length} resultados
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-10 md:grid-cols-[1fr_1.4fr] md:gap-16">
          <div>
            <h2 className="smallcaps text-sm text-ink-soft">Búsquedas frecuentes</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {SEARCH_SUGGESTIONS.map((s) => (
                <li key={s}>
                  <button type="button" onClick={() => setQ(s)} className="h-11 px-4 text-sm shadow-[inset_0_0_0_1px_var(--color-line-strong)] transition-colors hover:bg-ink hover:text-paper">
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="smallcaps text-sm text-ink-soft">Categorías</h2>
            <ul className="mt-3 grid grid-cols-2 gap-x-8">
              {categories.map((c) => (
                <li key={c.id} className="border-b border-line">
                  <Link href={`/shop/${c.id}`} onClick={onClose} className="group flex min-h-12 items-baseline justify-between gap-3 py-2">
                    <span className="font-serif text-2xl transition-transform duration-500 group-hover:translate-x-1.5">{c.label}</span>
                    <span className="numeral text-xs text-ink-soft">{productsByCategory(c.id).length}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
