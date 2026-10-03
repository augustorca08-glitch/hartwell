"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight } from "@phosphor-icons/react";
import { categories, productsByCategory } from "@/content/products";
import { categoryMedia } from "@/content/media";
import { EASE, LineReveal, Reveal } from "@/components/ui/motion";

/** Desktop: índice tipográfico con una lámina fija que cambia por fundido según la categoría. */
function IndexList() {
  const [active, setActive] = useState(categories[0].id);
  const media = categoryMedia[active];
  const cat = categories.find((c) => c.id === active)!;
  return (
    <div className="grid grid-cols-12 gap-10">
      <ul className="col-span-7 border-t border-line">
        {categories.map((c) => {
          const count = productsByCategory(c.id).length;
          const on = active === c.id;
          return (
            <li key={c.id} className="border-b border-line">
              <Link
                href={`/shop/${c.id}`}
                onPointerEnter={() => setActive(c.id)}
                onFocus={() => setActive(c.id)}
                className="group relative flex items-baseline gap-6 py-4 focus-visible:outline-offset-[-4px]"
              >
                <span className={`display text-[clamp(2.8rem,5vw,4.6rem)] leading-[1.05] transition-[transform,color] duration-700 ease-[var(--ease-quiet)] group-hover:translate-x-4 group-focus-visible:translate-x-4 ${on ? "text-navy" : ""}`}>
                  {on ? <em>{c.label}</em> : c.label}
                </span>
                <span className={`font-serif text-lg italic text-ink-soft transition-opacity duration-700 ${on ? "opacity-100" : "opacity-0"}`} lang="en">
                  {c.tagline}
                </span>
                <span className="numeral ml-auto text-sm text-ink-soft">
                  {count} {count === 1 ? "pieza" : "piezas"}
                </span>
                <span aria-hidden className={`absolute inset-x-0 -bottom-px h-px origin-left bg-ink transition-transform duration-700 ease-[var(--ease-quiet)] ${on ? "scale-x-100" : "scale-x-0"}`} />
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="col-span-5">
        <div className="sticky top-[calc(var(--header-h)+2rem)]">
          <div className="frame">
            <div className="relative aspect-[4/5] overflow-hidden bg-cream">
              <AnimatePresence initial={false}>
                <motion.div key={active} className="absolute inset-0" initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.1, ease: EASE }}>
                  <Image src={media.src} alt={media.alt} fill sizes="38vw" className="object-cover" />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          <p className="mt-3 flex items-center justify-between text-sm text-ink-soft">
            <span className="smallcaps">{cat.label}</span>
            <Link href={`/shop/${cat.id}`} className="label link-line inline-flex min-h-6 items-center gap-2 text-ink" tabIndex={-1}>
              Ver la categoría <ArrowRight size={13} weight="light" aria-hidden />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

/** Táctil / mobile: rail horizontal de láminas por categoría. */
function IndexRail() {
  return (
    <ul className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 md:-mx-10 md:scroll-px-10 md:px-10" data-lenis-prevent-wheel>
      {categories.map((c, i) => {
        const m = categoryMedia[c.id];
        return (
          <li key={c.id} className="w-[68vw] shrink-0 snap-start sm:w-[40vw]">
            <Link href={`/shop/${c.id}`} className="block">
              <span className="frame block">
                <span className={`relative block overflow-hidden bg-cream ${i % 2 ? "aspect-[3/4]" : "aspect-[4/5]"}`}>
                  <Image src={m.src} alt="" fill sizes="(min-width: 640px) 40vw, 68vw" className="object-cover" />
                </span>
              </span>
              <span className="display mt-3 block text-[2.1rem] leading-[1.05]">{c.label}</span>
              <span className="mt-1 block font-serif text-base italic text-ink-soft" lang="en">
                {c.tagline}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function CategoryIndex() {
  return (
    <section aria-labelledby="wardrobe-title" className="bg-paper px-4 py-24 md:px-10 lg:py-32">
      <div className="mx-auto max-w-[1440px]">
        <LineReveal id="wardrobe-title" lang="en" lines={[<>The <em>Wardrobe</em></>]} className="display text-[clamp(2.6rem,5vw,4.6rem)]" />
        <Reveal delay={0.1}>
          <p className="mt-4 max-w-[46ch] text-ink-soft">Seis familias de prendas que la Casa produce cada temporada, con las mismas telas y los mismos talleres.</p>
        </Reveal>
        <div className="mt-12 hidden [@media(hover:hover)_and_(min-width:1024px)]:block">
          <IndexList />
        </div>
        <div className="mt-10 [@media(hover:hover)_and_(min-width:1024px)]:hidden">
          <IndexRail />
        </div>
      </div>
    </section>
  );
}
