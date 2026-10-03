"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { collection } from "@/content/media";
import { Monogram } from "@/components/brand/logo";
import { EASE } from "@/components/ui/motion";
import { HeroMedia } from "./hero-media";

// Transformaciones en función: evitan la aceleración por ScrollTimeline, que al salir del rango vuelve al valor base
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/**
 * Hero de campaña: la toma de la finca a pantalla completa.
 * Al hacer scroll la fotografía se asienta dentro de un passe-partout de papel y aparece
 * el título de la colección en el margen: de la campaña a la colección.
 */
export function Hero({ hasVideo, hasMobileVideo }: { hasVideo: boolean; hasMobileVideo: boolean }) {
  const wrap = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const still = !!reduce;
  const { scrollYProgress: p } = useScroll({ target: wrap, offset: ["start start", "end end"] });

  const clip = useTransform(p, (v) => {
    const t = clamp01(v / 0.85);
    return `inset(${(7 * t).toFixed(2)}% ${(4.5 * t).toFixed(2)}% ${(15 * t).toFixed(2)}% ${(4.5 * t).toFixed(2)}%)`;
  });
  const mediaScale = useTransform(p, (v) => 1.06 - 0.06 * clamp01(v / 0.85));
  const copyOpacity = useTransform(p, (v) => 1 - clamp01(v / 0.35));
  const copyY = useTransform(p, (v) => -50 * clamp01(v / 0.4));
  const frameOpacity = useTransform(p, (v) => clamp01((v - 0.45) / 0.35));
  const titleY = useTransform(p, (v) => 24 * (1 - clamp01((v - 0.5) / 0.4)));

  return (
    <section ref={wrap} aria-labelledby="hero-title" className={`relative ${still ? "h-[100dvh]" : "h-[185dvh]"}`}>
      <div className="sticky top-0 h-[100dvh] min-h-[600px] overflow-hidden bg-paper">
        <motion.div className="absolute inset-0" style={still ? undefined : { clipPath: clip }}>
          <motion.div className="absolute inset-0" style={still ? undefined : { scale: mediaScale }}>
            <HeroMedia hasVideo={hasVideo} hasMobileVideo={hasMobileVideo} />
          </motion.div>
        </motion.div>

        {/* Filete del passe-partout */}
        {!still && (
          <motion.div aria-hidden style={{ opacity: frameOpacity }} className="pointer-events-none absolute inset-[calc(7%-10px)_calc(4.5%-10px)_calc(15%-10px)_calc(4.5%-10px)] shadow-[inset_0_0_0_1px_var(--color-line-strong)]" />
        )}

        {/* Copy de campaña */}
        <motion.div
          style={still ? undefined : { opacity: copyOpacity, y: copyY }}
          className="absolute inset-x-0 bottom-[12vh] z-10 mx-auto max-w-[1440px] px-5 text-paper md:bottom-[14vh] md:px-10"
          data-surface="dark"
        >
          <motion.p initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 1.4, ease: EASE }} className="smallcaps text-[0.95rem] text-paper/90">
            {collection.name} · {collection.season}
          </motion.p>
          <h1 id="hero-title" className="display mt-3 max-w-[12ch] pb-2 text-[clamp(3.3rem,8vw,8rem)] leading-[0.98]" lang="en">
            <span className="-mb-[0.14em] block overflow-hidden pb-[0.14em]">
              <motion.span className="block" initial={reduce ? false : { y: "105%" }} animate={{ y: "0%" }} transition={{ delay: 0.2, duration: 1.5, ease: EASE }}>
                Timeless
              </motion.span>
            </span>
            <span className="-mb-[0.14em] block overflow-hidden pb-[0.14em]">
              <motion.span className="block" initial={reduce ? false : { y: "105%" }} animate={{ y: "0%" }} transition={{ delay: 0.35, duration: 1.5, ease: EASE }}>
                <em>by design.</em>
              </motion.span>
            </span>
          </h1>
          <motion.div initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75, duration: 1.3, ease: EASE }}>
            <p className="mt-5 max-w-[36ch] text-[1.05rem] leading-relaxed text-paper/90 md:text-lg">Sastrería, punto y prendas de club, hechas para acompañar varias generaciones.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/collection/estate-summer" className="btn btn-paper">
                Discover the collection
              </Link>
              <Link href="/lookbook" className="btn btn-line-light">
                Lookbook
              </Link>
            </div>
          </motion.div>
        </motion.div>

        {/* Título en el margen inferior del passe-partout */}
        {!still && (
          <motion.div aria-hidden style={{ opacity: frameOpacity, y: titleY }} className="absolute inset-x-0 bottom-[3.5%] flex items-center justify-center gap-4 text-navy">
            <Monogram className="h-9 w-9 md:h-10 md:w-10" />
            <span className="display text-[clamp(1.5rem,2.6vw,2.3rem)]" lang="en">
              The Estate <em>Summer</em>
            </span>
          </motion.div>
        )}
      </div>
    </section>
  );
}
