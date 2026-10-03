"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Faders, X } from "@phosphor-icons/react";
import { categories, type CategoryId, type Product, stockOf } from "@/content/products";
import { categoryMedia, collection } from "@/content/media";
import type { ShopFilters } from "@/lib/filters";
import { ProductCard } from "@/components/product/product-card";
import { EASE } from "@/components/ui/motion";

const SORTS = [
  { id: "featured", label: "Selección de la Casa" },
  { id: "new", label: "Novedades" },
  { id: "price-asc", label: "Precio: menor a mayor" },
  { id: "price-desc", label: "Precio: mayor a menor" },
] as const;

export function ShopView({
  items,
  category,
  initial = {},
  heading,
  intro,
  query,
  emptyState,
}: {
  items: Product[];
  category?: CategoryId;
  initial?: ShopFilters;
  /** Encabezado alternativo (búsqueda) */
  heading?: React.ReactNode;
  intro?: string;
  /** Término de búsqueda: se conserva en la URL al filtrar */
  query?: string;
  /** Se muestra cuando no hay ninguna pieza (antes de filtrar) */
  emptyState?: React.ReactNode;
}) {
  const pathname = usePathname();
  const [filters, setFilters] = useState<ShopFilters>(initial);
  const color = filters.color ?? null;
  const size = filters.talle ?? null;
  const sort = filters.orden ?? "featured";
  // Mobile: los filtros se pliegan detrás de un botón para que las piezas aparezcan antes
  const [panel, setPanel] = useState(false);

  const apply = (next: ShopFilters) => {
    setFilters(next);
    const entries = Object.entries({ q: query, ...next }).filter((e): e is [string, string] => !!e[1]);
    const qs = new URLSearchParams(entries).toString();
    // Next sincroniza replaceState con el router sin re-render del servidor
    window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname);
  };
  const setParam = (key: keyof ShopFilters, value: string | null) => apply({ ...filters, [key]: value ?? undefined });
  const clear = () => apply({});

  const colorOptions = useMemo(() => {
    const map = new Map<string, { id: string; name: string; hex: string }>();
    items.forEach((p) => p.colors.forEach((c) => map.set(c.id, c)));
    return [...map.values()];
  }, [items]);
  const sizeOptions = useMemo(() => [...new Set(items.flatMap((p) => p.sizes))], [items]);

  const list = useMemo(() => {
    let out = items.filter((p) => {
      if (color && !p.colors.some((c) => c.id === color)) return false;
      if (size && !p.sizes.includes(size)) return false;
      if (size && !p.colors.some((c) => (!color || c.id === color) && stockOf(p, c.id, size) > 0)) return false;
      return true;
    });
    if (sort === "price-asc") out = [...out].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") out = [...out].sort((a, b) => b.price - a.price);
    if (sort === "new") out = [...out].sort((a, b) => Number(b.tags.includes("new")) - Number(a.tags.includes("new")));
    if (sort === "featured") out = [...out].sort((a, b) => Number(b.tags.includes("featured")) - Number(a.tags.includes("featured")));
    return out;
  }, [items, color, size, sort]);

  const cat = category ? categories.find((c) => c.id === category) : undefined;
  const editorial = cat ? categoryMedia[cat.id] : collection.lead;
  const active = [color && colorOptions.find((c) => c.id === color)?.name, size && (size === "Única" ? "Talle único" : `Talle ${size}`)].filter(Boolean);

  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-28 pt-[calc(var(--header-h)+3rem)] md:px-10 lg:pt-[calc(var(--header-h)+4.5rem)]">
      <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
        <motion.div className="lg:col-span-8" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, ease: EASE }}>
          {heading ?? (
            <h1 className="display text-[clamp(3.2rem,8vw,7.5rem)] leading-[0.98]" lang="en">
              {cat ? cat.label : (
                <>
                  The <em>Shop</em>
                </>
              )}
            </h1>
          )}
        </motion.div>
        <motion.p
          className="max-w-[36ch] font-serif text-xl italic leading-snug text-ink-soft lg:col-span-4 lg:pb-3"
          lang={intro ? undefined : "en"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.1, delay: 0.25, ease: EASE }}
        >
          {intro ?? (cat ? cat.tagline : "Everything the House makes, season after season.")}
        </motion.p>
      </div>

      {!query && (
        <nav aria-label="Categorías" className="scrollbar-none -mx-4 mt-10 overflow-x-auto px-4 md:mx-0 md:px-0">
          <ul className="flex w-max gap-1 border-b border-line">
            {[{ id: undefined, label: "Todo" }, ...categories].map((c) => {
              const href = c.id ? `/shop/${c.id}` : "/shop";
              const current = c.id === category;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={current ? "page" : undefined}
                    className={`relative flex h-12 items-center px-4 text-[0.95rem] transition-colors duration-500 ${current ? "text-ink" : "text-ink-soft hover:text-ink"}`}
                  >
                    {c.label}
                    <span className={`absolute inset-x-4 -bottom-px h-px bg-ink transition-transform duration-700 ease-[var(--ease-quiet)] ${current ? "scale-x-100" : "scale-x-0"}`} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      {items.length === 0 && emptyState ? (
        <div className="mt-12 border-t border-line pt-12">{emptyState}</div>
      ) : (
      <>
      <button
        type="button"
        onClick={() => setPanel((v) => !v)}
        aria-expanded={panel}
        aria-controls="shop-filters"
        className="mt-6 flex h-12 w-full items-center justify-between border-b border-line text-[0.95rem] lg:hidden"
      >
        <span className="inline-flex items-center gap-2">
          <Faders size={18} weight="light" aria-hidden /> Filtrar y ordenar
        </span>
        <span className="numeral text-sm text-ink-soft">{color || size || filters.orden ? "Activos" : ""}</span>
      </button>
      <div id="shop-filters" className={`mt-6 flex-wrap items-end gap-x-10 gap-y-5 border-b border-line pb-5 lg:flex ${panel ? "flex" : "hidden"}`}>
        <fieldset>
          <legend className="smallcaps mb-2 text-sm text-ink-soft">Color</legend>
          <div className="flex flex-wrap gap-0.5">
            {colorOptions.map((c) => (
              <button key={c.id} type="button" aria-pressed={color === c.id} onClick={() => setParam("color", color === c.id ? null : c.id)} className="grid h-11 w-11 place-items-center" title={c.name}>
                <span
                  className={`block h-6 w-6 shadow-[inset_0_0_0_1px_rgb(28_29_33_/_0.2)] outline outline-1 outline-offset-[3px] transition-[outline-color] duration-500 ${color === c.id ? "outline-ink" : "outline-transparent"}`}
                  style={{ background: c.hex }}
                />
                <span className="sr-only">{c.name}</span>
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="smallcaps mb-2 text-sm text-ink-soft">Talle</legend>
          <div className="flex flex-wrap gap-1">
            {sizeOptions.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={size === s}
                onClick={() => setParam("talle", size === s ? null : s)}
                className={`numeral h-11 min-w-11 px-3 text-sm transition-colors duration-500 ${size === s ? "bg-navy text-paper" : "hover:bg-ink/[0.05]"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="ml-auto">
          <label htmlFor="sort" className="smallcaps mb-2 block text-sm text-ink-soft">
            Ordenar
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setParam("orden", e.target.value === "featured" ? null : e.target.value)}
            className="h-11 border-b border-ink bg-transparent pr-8 text-[0.95rem] text-ink"
          >
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex min-h-11 flex-wrap items-center gap-2" aria-live="polite">
        <p className="numeral text-sm text-ink-soft">
          {list.length} {list.length === 1 ? "pieza" : "piezas"}
        </p>
        {active.map((a) => (
          <span key={a as string} className="tag smallcaps text-sm">
            {a}
          </span>
        ))}
        {active.length > 0 && (
          <button type="button" onClick={() => clear()} className="link-rule ml-2 inline-flex min-h-11 items-center gap-1.5 text-sm">
            <X size={13} weight="light" aria-hidden /> Limpiar filtros
          </button>
        )}
      </div>

      {list.length === 0 ? (
        <div className="py-24">
          <p className="display text-[clamp(2.6rem,6vw,4.6rem)]">
            Nada por <em>aquí.</em>
          </p>
          <p className="mt-4 max-w-[42ch] text-ink-soft">Ninguna pieza coincide con estos filtros. Otro talle o color puede dar con lo buscado.</p>
          <button type="button" onClick={() => clear()} className="btn mt-8">
            Limpiar filtros
          </button>
        </div>
      ) : (
        <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-14 md:gap-x-8 lg:grid-cols-3 lg:gap-x-10 lg:gap-y-20">
          <AnimatePresence mode="popLayout">
            {list.map((p, i) => (
              <motion.li
                key={p.slug}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: EASE }}
                className={i % 3 === 1 ? "lg:mt-20" : ""}
              >
                <ProductCard product={p} headingLevel={2} preload={i < 2} sizes="(min-width: 1024px) 30vw, 50vw" />
              </motion.li>
            ))}
            {list.length >= 5 && !query && (
              <motion.li key="editorial" layout className="col-span-2 lg:col-span-3">
                <Link href={cat ? "/lookbook" : "/collection/estate-summer"} className="group grid items-center gap-6 bg-forest p-3 text-paper md:grid-cols-[1.1fr_1fr] md:gap-12 md:p-5" data-surface="dark">
                  <span className="relative block aspect-[16/10] overflow-hidden bg-forest-deep">
                    <Image src={editorial.src} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-[1.8s] ease-[var(--ease-quiet)] group-hover:scale-[1.04]" />
                  </span>
                  <span className="block px-3 pb-5 md:px-0 md:pb-0">
                    <span className="smallcaps block text-sm text-gold-soft">{cat ? "Lookbook" : collection.season}</span>
                    <span className="display mt-2 block text-[clamp(2.2rem,4vw,3.6rem)]" lang="en">
                      {cat ? (
                        <>
                          Seen on <em>the estate</em>
                        </>
                      ) : (
                        <>
                          The Estate <em>Summer</em>
                        </>
                      )}
                    </span>
                    <span className="label link-line mt-6 inline-block">{cat ? "Ver el lookbook" : "Descubrir la colección"}</span>
                  </span>
                </Link>
              </motion.li>
            )}
          </AnimatePresence>
        </ul>
      )}
      </>
      )}
    </div>
  );
}
