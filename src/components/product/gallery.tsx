"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { ArrowLeft, ArrowRight, MagnifyingGlassPlus, X } from "@phosphor-icons/react";
import { useFocusTrap, useScrollLock } from "@/lib/dom";
import { roman } from "@/lib/site";
import { EASE } from "@/components/ui/motion";

type Img = { src: string; alt: string };

/** Lightbox con zoom: desktop sigue al cursor, táctil alterna el zoom en el punto tocado. */
function Lightbox({ images, index, onClose, onIndex }: { images: Img[]; index: number; onClose: () => void; onIndex: (i: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(false);
  const ox = useMotionValue(50);
  const oy = useMotionValue(50);
  const originX = useTransform(ox, (v) => v / 100);
  const originY = useTransform(oy, (v) => v / 100);
  useFocusTrap(ref, true, onClose);
  useScrollLock(true);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") onIndex((index + 1) % images.length);
      if (e.key === "ArrowLeft") onIndex((index - 1 + images.length) % images.length);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [index, images.length, onIndex]);

  const setOrigin = (e: React.PointerEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    ox.set(((e.clientX - r.left) / r.width) * 100);
    oy.set(((e.clientY - r.top) / r.height) * 100);
  };

  const img = images[index];
  const go = (d: number) => {
    setZoom(false);
    onIndex((index + d + images.length) % images.length);
  };
  return (
    <motion.div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={`Imagen ampliada ${index + 1} de ${images.length}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="fixed inset-0 z-[60] flex flex-col bg-paper"
    >
      <div className="flex h-[var(--header-h)] shrink-0 items-center justify-between px-4 md:px-10">
        <p className="smallcaps text-sm text-ink-soft" aria-live="polite">
          Lámina {roman(index + 1)} de {roman(images.length)}
        </p>
        <button type="button" onClick={onClose} data-autofocus aria-label="Cerrar imagen ampliada" className="-mr-2 grid h-11 w-11 place-items-center hover:text-navy">
          <X size={20} weight="light" aria-hidden />
        </button>
      </div>
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <motion.button
          type="button"
          aria-label={zoom ? "Alejar" : "Acercar"}
          onPointerMove={(e) => zoom && e.pointerType === "mouse" && setOrigin(e)}
          onPointerDown={setOrigin}
          onClick={() => setZoom((z) => !z)}
          className="absolute inset-0 h-full w-full overflow-hidden focus-visible:outline-offset-[-4px]"
          style={{ cursor: zoom ? "zoom-out" : "zoom-in" }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={img.src} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45, ease: EASE }} className="absolute inset-0">
              <motion.div className="absolute inset-0" animate={{ scale: zoom ? 2.1 : 1 }} transition={{ duration: 0.7, ease: EASE }} style={{ originX, originY }}>
                <Image src={img.src} alt={img.alt} fill sizes="100vw" quality={85} className="object-contain" />
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </motion.button>
      </div>
      <div className="flex shrink-0 items-center justify-center gap-3 py-4">
        <button type="button" onClick={() => go(-1)} aria-label="Imagen anterior" className="grid h-12 w-12 place-items-center shadow-[inset_0_0_0_1px_var(--color-line-strong)] transition-colors duration-500 hover:bg-navy hover:text-paper">
          <ArrowLeft size={18} weight="light" aria-hidden />
        </button>
        <button type="button" onClick={() => go(1)} aria-label="Imagen siguiente" className="grid h-12 w-12 place-items-center shadow-[inset_0_0_0_1px_var(--color-line-strong)] transition-colors duration-500 hover:bg-navy hover:text-paper">
          <ArrowRight size={18} weight="light" aria-hidden />
        </button>
      </div>
    </motion.div>
  );
}

/**
 * Galería de producto.
 * Desktop: láminas enmarcadas en composición asimétrica (una mayor, dos desplazadas).
 * Mobile: carrusel a ancho completo con snap. El cambio de color funde toda la galería.
 */
export function Gallery({ images, colorKey, name }: { images: Img[]; colorKey: string; name: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const [slide, setSlide] = useState(0);
  const rail = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const onRailScroll = () => {
    const el = rail.current;
    if (!el) return;
    setSlide(Math.round(el.scrollLeft / el.clientWidth));
  };

  const [lastKey, setLastKey] = useState(colorKey);
  if (lastKey !== colorKey) {
    setLastKey(colorKey);
    setSlide(0);
  }
  useEffect(() => {
    rail.current?.scrollTo({ left: 0 });
  }, [colorKey]);

  const layouts = ["col-span-12", "col-span-7 mt-0", "col-span-5 mt-[28%]"];

  return (
    <>
      {/* Mobile / tablet: carrusel */}
      <div className="lg:hidden">
        <div ref={rail} onScroll={onRailScroll} className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto" role="region" aria-label={`Fotos de ${name}`} tabIndex={0}>
          {images.map((img, i) => (
            <button key={`${colorKey}-${i}`} type="button" onClick={() => setOpen(i)} className="relative aspect-[4/5] w-full shrink-0 snap-start bg-ivory" aria-label={`Ampliar foto ${i + 1} de ${images.length}`}>
              <Image src={img.src} alt={img.alt} fill preload={i === 0} sizes="100vw" className="object-cover" />
            </button>
          ))}
        </div>
        <div className="mt-4 flex justify-center gap-2" aria-hidden>
          {images.map((_, i) => (
            <span key={i} className="h-px w-8 bg-line-strong">
              <span className={`block h-px bg-ink transition-transform duration-700 ease-[var(--ease-quiet)] ${slide === i ? "scale-x-100" : "scale-x-0"} origin-left`} />
            </span>
          ))}
        </div>
      </div>

      {/* Desktop: composición enmarcada */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={colorKey}
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="hidden grid-cols-12 items-start gap-6 lg:grid"
        >
          {images.map((img, i) => (
            <figure key={img.src} className={layouts[i] ?? "col-span-12"}>
              <div className="frame">
                <button
                  type="button"
                  id={`photo-${i}`}
                  onClick={() => setOpen(i)}
                  className="group relative block aspect-[4/5] w-full overflow-hidden bg-cream"
                  aria-label={`Ampliar foto ${i + 1} de ${images.length}`}
                  style={{ cursor: "zoom-in" }}
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    preload={i === 0}
                    sizes={i === 0 ? "(min-width: 1024px) 50vw, 100vw" : "28vw"}
                    className="object-cover transition-transform duration-[1.6s] ease-[var(--ease-quiet)] group-hover:scale-[1.03]"
                  />
                  <span className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center bg-paper/90 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
                    <MagnifyingGlassPlus size={18} weight="light" aria-hidden />
                  </span>
                </button>
              </div>
              <figcaption className="smallcaps mt-2 text-xs text-ink-soft">Lámina {roman(i + 1)}</figcaption>
            </figure>
          ))}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>{open !== null && <Lightbox images={images} index={open} onClose={() => setOpen(null)} onIndex={setOpen} />}</AnimatePresence>
    </>
  );
}
