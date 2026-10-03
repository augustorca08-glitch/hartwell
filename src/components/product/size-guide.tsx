"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Ruler, X } from "@phosphor-icons/react";
import type { Product, SizeKind } from "@/content/products";
import { useFocusTrap, useScrollLock } from "@/lib/dom";
import { EASE } from "@/components/ui/motion";

const TABLES: Record<Exclude<SizeKind, "one">, { cols: [string, string]; rows: [string, string, string][] }> = {
  tops: { cols: ["Ancho de pecho", "Largo"], rows: [["XS", "48 cm", "70 cm"], ["S", "51 cm", "72 cm"], ["M", "54 cm", "74 cm"], ["L", "57 cm", "76 cm"], ["XL", "60 cm", "78 cm"]] },
  tailoring: { cols: ["Contorno de pecho", "Largo de espalda"], rows: [["46", "92 cm", "72 cm"], ["48", "96 cm", "73 cm"], ["50", "100 cm", "74 cm"], ["52", "104 cm", "75 cm"], ["54", "108 cm", "76 cm"]] },
  trousers: { cols: ["Cintura", "Largo de entrepierna"], rows: [["44", "76 cm", "80 cm"], ["46", "80 cm", "81 cm"], ["48", "84 cm", "82 cm"], ["50", "88 cm", "83 cm"], ["52", "92 cm", "84 cm"]] },
  belt: { cols: ["Largo al agujero central", "Pantalón sugerido"], rows: [["80", "80 cm", "44"], ["85", "85 cm", "46"], ["90", "90 cm", "48"], ["95", "95 cm", "50"], ["100", "100 cm", "52"]] },
};

export function SizeGuide({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, open, () => setOpen(false));
  useScrollLock(open);
  if (product.sizeKind === "one") return null;
  const table = TABLES[product.sizeKind];
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="link-rule inline-flex min-h-11 items-center gap-2 text-sm">
        <Ruler size={16} weight="light" aria-hidden /> Guía de talles
      </button>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center md:items-center">
            <motion.div className="absolute inset-0 bg-navy-deep/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} aria-hidden />
            <motion.div
              ref={ref}
              role="dialog"
              aria-modal="true"
              aria-labelledby="size-guide-title"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="relative w-full max-w-lg bg-paper p-7 pb-[max(1.75rem,env(safe-area-inset-bottom))]"
            >
              <div className="flex items-start justify-between gap-4">
                <h2 id="size-guide-title" className="display text-4xl">
                  Guía de <em>talles</em>
                </h2>
                <button type="button" onClick={() => setOpen(false)} data-autofocus aria-label="Cerrar guía de talles" className="-mr-2 grid h-11 w-11 place-items-center">
                  <X size={18} weight="light" aria-hidden />
                </button>
              </div>
              <p className="mt-2 text-sm text-ink-soft">{product.fit}</p>
              <table className="numeral mt-6 w-full text-left text-sm">
                <caption className="sr-only">Medidas de la prenda en centímetros</caption>
                <thead>
                  <tr className="smallcaps text-ink-soft">
                    <th scope="col" className="pb-3 font-medium">Talle</th>
                    <th scope="col" className="pb-3 font-medium">{table.cols[0]}</th>
                    <th scope="col" className="pb-3 font-medium">{table.cols[1]}</th>
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((r, i) => (
                    <tr key={r[0]} className={i % 2 ? "" : "bg-ivory"}>
                      <th scope="row" className="px-3 py-3 font-medium">{r[0]}</th>
                      <td className="py-3">{r[1]}</td>
                      <td className="py-3">{r[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-5 text-sm text-ink-soft">Medidas de la prenda en plano. Ante la duda entre dos talles, el concierge puede ayudar a elegir.</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
