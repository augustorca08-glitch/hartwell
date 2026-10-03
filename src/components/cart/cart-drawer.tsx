"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, WhatsappLogo, ArrowRight } from "@phosphor-icons/react";
import { resolveLines, sizeLabel, subtotalOf, useCart } from "@/lib/cart";
import { useFocusTrap, useScrollLock } from "@/lib/dom";
import { FREE_SHIPPING_FROM, formatPrice, whatsappLink } from "@/lib/site";
import { QtyStepper } from "@/components/ui/qty-stepper";
import { Monogram } from "@/components/brand/logo";
import { EASE } from "@/components/ui/motion";

export function orderMessage(lines: ReturnType<typeof resolveLines>) {
  const items = lines.map((l) => `• ${l.qty} × ${l.name} (${l.colorName}, ${sizeLabel(l.size).toLowerCase()}) ${formatPrice(l.price * l.qty)}`);
  return `Hola HARTWELL, quisiera consultar por este pedido:\n${items.join("\n")}\nSubtotal: ${formatPrice(subtotalOf(lines))}`;
}

export function CartDrawer() {
  const open = useCart((s) => s.open);
  const setOpen = useCart((s) => s.setOpen);
  const raw = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const lastRemoved = useCart((s) => s.lastRemoved);
  const undo = useCart((s) => s.undoRemove);
  const lines = resolveLines(raw);
  const subtotal = subtotalOf(lines);
  const panel = useRef<HTMLDivElement>(null);
  const close = () => setOpen(false);
  useFocusTrap(panel, open, close);
  useScrollLock(open);

  const remaining = FREE_SHIPPING_FROM - subtotal;
  const count = lines.reduce((n, l) => n + l.qty, 0);

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
            onClick={close}
            aria-hidden
          />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="bag-title"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.75, ease: EASE }}
            className="absolute inset-y-0 right-0 flex w-full max-w-[480px] flex-col bg-paper text-ink shadow-[-40px_0_80px_-40px_rgb(17_27_44_/_0.45)]"
          >
            <div className="flex h-[var(--header-h)] shrink-0 items-center justify-between border-b border-line px-6">
              <h2 id="bag-title" className="display text-3xl">
                La bolsa <span className="numeral align-middle font-sans text-sm text-ink-soft">({count})</span>
              </h2>
              <button type="button" onClick={close} data-autofocus aria-label="Cerrar la bolsa" className="-mr-2 grid h-11 w-11 place-items-center hover:text-navy">
                <X size={20} weight="light" aria-hidden />
              </button>
            </div>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col justify-center px-8 pb-16">
                <Monogram className="h-12 w-12 text-gold" />
                <p className="display mt-8 text-[2.6rem] leading-[1.05]">
                  La bolsa está <em>vacía.</em>
                </p>
                <p className="mt-4 max-w-[34ch] text-ink-soft">Un buen punto de partida: la nueva colección o las piezas esenciales de la Casa.</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/collection/estate-summer" onClick={close} className="btn">
                    New Collection
                  </Link>
                  <Link href="/shop" onClick={close} className="btn btn-line">
                    Ver el shop
                  </Link>
                </div>
                {lastRemoved && (
                  <button type="button" onClick={undo} className="link-rule mt-8 self-start text-sm">
                    Deshacer: volver a agregar la última pieza
                  </button>
                )}
              </div>
            ) : (
              <>
                <p className="border-b border-line px-6 py-3 text-sm" aria-live="polite">
                  {remaining > 0 ? (
                    <>
                      Faltan <strong className="numeral font-medium">{formatPrice(remaining)}</strong> para el envío sin cargo.
                    </>
                  ) : (
                    <span className="text-forest">El envío de este pedido es sin cargo.</span>
                  )}
                </p>
                <ul className="flex-1 overflow-y-auto overscroll-contain px-6" data-lenis-prevent>
                  <AnimatePresence initial={false}>
                    {lines.map((l) => (
                      <motion.li
                        key={l.key}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.5, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-[92px_1fr] gap-5 border-b border-line py-6">
                          <Link href={`/product/${l.slug}?color=${l.colorId}`} onClick={close} className="relative block aspect-[4/5] overflow-hidden bg-ivory">
                            <Image src={l.image} alt={`${l.name} en ${l.colorName}`} fill sizes="92px" className="object-cover" />
                          </Link>
                          <div className="flex min-w-0 flex-col">
                            <div className="flex items-start justify-between gap-3">
                              <Link href={`/product/${l.slug}?color=${l.colorId}`} onClick={close} className="-my-1 inline-block py-1 font-serif text-xl leading-tight hover:text-navy">
                                {l.name}
                              </Link>
                              <span className="numeral shrink-0 pt-1 text-sm">{formatPrice(l.price * l.qty)}</span>
                            </div>
                            <p className="mt-1 text-sm text-ink-soft">
                              {l.colorName} · {sizeLabel(l.size)}
                            </p>
                            <div className="mt-auto flex items-center justify-between pt-3">
                              <QtyStepper value={l.qty} max={l.max} onChange={(q) => setQty(l.key, q)} label={`Cantidad de ${l.name}`} size="sm" />
                              <button type="button" onClick={() => remove(l.key)} className="link-rule min-h-11 text-sm text-ink-soft hover:text-ink">
                                Quitar<span className="sr-only"> {l.name}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                  {lastRemoved && (
                    <li className="py-4">
                      <button type="button" onClick={undo} className="link-rule text-sm">
                        Deshacer
                      </button>
                    </li>
                  )}
                </ul>
                <div className="shrink-0 border-t border-line bg-paper px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5">
                  <div className="flex items-baseline justify-between">
                    <span className="smallcaps text-base">Subtotal</span>
                    <span className="numeral text-lg">{formatPrice(subtotal)}</span>
                  </div>
                  <p className="mt-1 text-sm text-ink-soft">Envío e impuestos se calculan en el checkout.</p>
                  <div className="mt-5 grid gap-2">
                    <Link href="/checkout" onClick={close} className="btn w-full">
                      Ir al checkout <ArrowRight size={14} weight="light" aria-hidden />
                    </Link>
                    <a href={whatsappLink(orderMessage(lines))} target="_blank" rel="noopener noreferrer" className="btn btn-line w-full">
                      <WhatsappLogo size={17} weight="light" aria-hidden /> Concierge por WhatsApp
                    </a>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
